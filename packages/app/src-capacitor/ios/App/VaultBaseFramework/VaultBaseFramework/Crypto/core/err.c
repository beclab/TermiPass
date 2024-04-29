//
//  err.c
//  VaultBaseFramework
//
//  Created by gjm on 2023/2/16.
//

#include <stdio.h>
#include <openssl/err.h>
#include <openssl/conf.h>


static ossl_inline unsigned int value_barrier(unsigned int a)
{
#if !defined(OPENSSL_NO_ASM) && defined(__GNUC__)
    unsigned int r;
    __asm__("" : "=r"(r) : "0"(a));
#else
    volatile unsigned int r = a;
#endif
    return r;
}


static ossl_inline unsigned int constant_time_select(unsigned int mask,
                                                     unsigned int a,
                                                     unsigned int b)
{
    return (value_barrier(mask) & a) | (value_barrier(~mask) & b);
}


static ossl_inline int constant_time_select_int(unsigned int mask, int a,
                                                int b)
{
    return (int)constant_time_select(mask, (unsigned)(a), (unsigned)(b));
}

static ossl_inline unsigned int constant_time_msb(unsigned int a)
{
    return 0 - (a >> (sizeof(a) * 8 - 1));
}


static ossl_inline unsigned int constant_time_is_zero(unsigned int a)
{
    return constant_time_msb(~a & (a - 1));
}

static ossl_inline unsigned int constant_time_eq(unsigned int a,
                                                 unsigned int b)
{
    return constant_time_is_zero(a ^ b);
}


static ossl_inline unsigned int constant_time_eq_int(int a, int b)
{
    return constant_time_eq((unsigned)(a), (unsigned)(b));
}



//void err_clear_last_constant_time_new(int clear)
//{
//    ERR_STATE *es;
//    int top;
//
//    es = ERR_get_state();
//    if (es == NULL)
//        return;
//
//    top = es->top;
//
//    /*
//     * Flag error as cleared but remove it elsewhere to avoid two errors
//     * accessing the same error stack location, revealing timing information.
//     */
//    clear = constant_time_select_int(constant_time_eq_int(clear, 0),
//                                     0, ERR_FLAG_CLEAR);
//    es->err_flags[top] |= clear;
//}

