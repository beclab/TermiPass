//
//  RSAFixed.h
//  App
//
//  Created by gjm on 2023/2/15.
//

#ifndef RSAFixed_h
#define RSAFixed_h


#include <openssl/rsa.h>
#include <openssl/err.h>
#include <openssl/rand.h>
#include <openssl/evp.h>
#include <openssl/bn.h>
#include <openssl/ossl_typ.h>

#include "RSALocal.h"
#include "err.c"
//#include "openssl/rsa.h"
//#include "openssl/err.h"
//#include "openssl/rand.h"
//#include "openssl/evp.h"
//#include "openssl/bn.h"
//#include "openssl/ossl_typ.h"


static BN_BLINDING *rsa_get_blinding(RSA *rsa, int *local, BN_CTX *ctx)
{
    BN_BLINDING *ret;
    
    if (!CRYPTO_THREAD_write_lock(rsa->lock))
        return NULL;
    
    if (rsa->blinding == NULL) {
        rsa->blinding = RSA_setup_blinding(rsa, ctx);
    }
    
    ret = rsa->blinding;
    if (ret == NULL)
        goto err;
    
    if (BN_BLINDING_is_current_thread(ret)) {
        /* rsa->blinding is ours! */
        
        *local = 1;
    } else {
        /* resort to rsa->mt_blinding instead */
        
        /*
         * instructs rsa_blinding_convert(), rsa_blinding_invert() that the
         * BN_BLINDING is shared, meaning that accesses require locks, and
         * that the blinding factor must be stored outside the BN_BLINDING
         */
        *local = 0;
        
        if (rsa->mt_blinding == NULL) {
            rsa->mt_blinding = RSA_setup_blinding(rsa, ctx);
        }
        ret = rsa->mt_blinding;
    }
    
err:
    CRYPTO_THREAD_unlock(rsa->lock);
    return ret;
}

static int rsa_blinding_convert(BN_BLINDING *b, BIGNUM *f, BIGNUM *unblind,
                                BN_CTX *ctx)
{
    if (unblind == NULL) {
        /*
         * Local blinding: store the unblinding factor in BN_BLINDING.
         */
        return BN_BLINDING_convert_ex(f, NULL, b, ctx);
    } else {
        /*
         * Shared blinding: store the unblinding factor outside BN_BLINDING.
         */
        int ret;
        
        BN_BLINDING_lock(b);
        ret = BN_BLINDING_convert_ex(f, unblind, b, ctx);
        BN_BLINDING_unlock(b);
        
        return ret;
    }
}


static int rsa_blinding_invert(BN_BLINDING *b, BIGNUM *f, BIGNUM *unblind,
                               BN_CTX *ctx)
{
    /*
     * For local blinding, unblind is set to NULL, and BN_BLINDING_invert_ex
     * will use the unblinding factor stored in BN_BLINDING. If BN_BLINDING
     * is shared between threads, unblind must be non-null:
     * BN_BLINDING_invert_ex will then use the local unblinding factor, and
     * will only read the modulus from BN_BLINDING. In both cases it's safe
     * to access the blinding without a lock.
     */
    return BN_BLINDING_invert_ex(f, unblind, b, ctx);
}



static int RSA_padding_check_PKCS1_OAEP_mgf256(unsigned char *to, int tlen,
                                               const unsigned char *from, int flen,
                                               int num, const unsigned char *param,
                                               int plen, const EVP_MD *md,
                                               const EVP_MD *mgf1md)
{
    if (md == NULL)
        md = EVP_sha256();
//    if (mgf1md == NULL)
//        mgf1md = md;
    return RSA_padding_check_PKCS1_OAEP_mgf1(to, tlen, from, flen, num, param, plen, md, mgf1md);
}

static int RSA_padding_check_PKCS1_OAEP_256(unsigned char *to, int tlen,
                                            const unsigned char *from, int flen, int num,
                                            const unsigned char *param, int plen)
{
    return RSA_padding_check_PKCS1_OAEP_mgf256(to, tlen, from, flen, num,
                                               param, plen, NULL, NULL);
}

static int rsa_ossl_private_decrypt(int flen, const unsigned char *from,
                                    unsigned char *to, RSA *rsa, int padding)
{
    BIGNUM *f, *ret;
        int j, num = 0, r = -1;
        unsigned char *buf = NULL;
        BN_CTX *ctx = NULL;
        int local_blinding = 0;
        /*
         * Used only if the blinding structure is shared. A non-NULL unblind
         * instructs rsa_blinding_convert() and rsa_blinding_invert() to store
         * the unblinding factor outside the blinding structure.
         */
        BIGNUM *unblind = NULL;
        BN_BLINDING *blinding = NULL;

        if ((ctx = BN_CTX_new()) == NULL)
            goto err;
        BN_CTX_start(ctx);
        f = BN_CTX_get(ctx);
        ret = BN_CTX_get(ctx);
        num = BN_num_bytes(rsa->n);
        buf = OPENSSL_malloc(num);
        if (ret == NULL || buf == NULL) {
            RSAerr(RSA_F_RSA_OSSL_PRIVATE_DECRYPT, ERR_R_MALLOC_FAILURE);
            goto err;
        }

        /*
         * This check was for equality but PGP does evil things and chops off the
         * top '0' bytes
         */
        if (flen > num) {
            RSAerr(RSA_F_RSA_OSSL_PRIVATE_DECRYPT,
                   RSA_R_DATA_GREATER_THAN_MOD_LEN);
            goto err;
        }

        /* make data into a big number */
        if (BN_bin2bn(from, (int)flen, f) == NULL)
            goto err;

        if (BN_ucmp(f, rsa->n) >= 0) {
            RSAerr(RSA_F_RSA_OSSL_PRIVATE_DECRYPT,
                   RSA_R_DATA_TOO_LARGE_FOR_MODULUS);
            goto err;
        }

        if (!(rsa->flags & RSA_FLAG_NO_BLINDING)) {
            blinding = rsa_get_blinding(rsa, &local_blinding, ctx);
            if (blinding == NULL) {
                RSAerr(RSA_F_RSA_OSSL_PRIVATE_DECRYPT, ERR_R_INTERNAL_ERROR);
                goto err;
            }
        }

        if (blinding != NULL) {
            if (!local_blinding && ((unblind = BN_CTX_get(ctx)) == NULL)) {
                RSAerr(RSA_F_RSA_OSSL_PRIVATE_DECRYPT, ERR_R_MALLOC_FAILURE);
                goto err;
            }
            if (!rsa_blinding_convert(blinding, f, unblind, ctx))
                goto err;
        }

        /* do the decrypt */
        if ((rsa->flags & RSA_FLAG_EXT_PKEY) ||
            (rsa->version == RSA_ASN1_VERSION_MULTI) ||
            ((rsa->p != NULL) &&
             (rsa->q != NULL) &&
             (rsa->dmp1 != NULL) && (rsa->dmq1 != NULL) && (rsa->iqmp != NULL))) {
            if (!rsa->meth->rsa_mod_exp(ret, f, rsa, ctx))
                goto err;
        } else {
            BIGNUM *d = BN_new();
            if (d == NULL) {
                RSAerr(RSA_F_RSA_OSSL_PRIVATE_DECRYPT, ERR_R_MALLOC_FAILURE);
                goto err;
            }
            if (rsa->d == NULL) {
                RSAerr(RSA_F_RSA_OSSL_PRIVATE_DECRYPT, RSA_R_MISSING_PRIVATE_KEY);
                BN_free(d);
                goto err;
            }
            BN_with_flags(d, rsa->d, BN_FLG_CONSTTIME);

            if (rsa->flags & RSA_FLAG_CACHE_PUBLIC)
                if (!BN_MONT_CTX_set_locked(&rsa->_method_mod_n, rsa->lock,
                                            rsa->n, ctx)) {
                    BN_free(d);
                    goto err;
                }
            if (!rsa->meth->bn_mod_exp(ret, f, d, rsa->n, ctx,
                                       rsa->_method_mod_n)) {
                BN_free(d);
                goto err;
            }
            /* We MUST free d before any further use of rsa->d */
            BN_free(d);
        }

        if (blinding)
            if (!rsa_blinding_invert(blinding, ret, unblind, ctx))
                goto err;

        j = BN_bn2binpad(ret, buf, num);

    
    switch (padding) {
        case RSA_PKCS1_PADDING:
            r = RSA_padding_check_PKCS1_type_2(to, num, buf, j, num);
            break;
        case RSA_PKCS1_OAEP_PADDING:
            r = RSA_padding_check_PKCS1_OAEP_256(to, num, buf, j, num, NULL, 0);
            break;
        case RSA_SSLV23_PADDING:
            r = RSA_padding_check_SSLv23(to, num, buf, j, num);
            break;
        case RSA_NO_PADDING:
            memcpy(to, buf, (r = j));
            break;
        default:
            RSAerr(RSA_F_RSA_OSSL_PRIVATE_DECRYPT, RSA_R_UNKNOWN_PADDING_TYPE);
            goto err;
    }
    RSAerr(RSA_F_RSA_OSSL_PRIVATE_DECRYPT, RSA_R_PADDING_CHECK_FAILED);
//        err_clear_last_constant_time_new(1 & ~constant_time_msb(r));
    
err:
    BN_CTX_end(ctx);
    BN_CTX_free(ctx);
    OPENSSL_clear_free(buf, num);
    return r;
}

static int RSA_ossl_private_decrypt_sha256(int flen, const unsigned char *from,
                                           unsigned char *to, RSA *rsa, int padding) {
    return  rsa_ossl_private_decrypt(flen, from, to, rsa, padding);
}


#endif /* RSAFixed_h */
