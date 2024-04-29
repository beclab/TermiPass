//
//  OpenSSLTool.m
//  App
//
//  Created by gjm on 2023/2/15.
//

#import "OpenSSLTool.h"
#include "RSAFixed.h"
#import <openssl/pem.h>

@implementation OpenSSLTool

//通过私钥生成key
+ (RSA *)createRsaKeyWithPrivateKey:(NSString *) privateKey{
    
    //为了避免写法的不同意，如果私钥已经带有下面标记字符，先去除，后面再统一加上固定格式
    NSRange spos = [privateKey rangeOfString:@"-----BEGIN RSA PRIVATE KEY-----"];
    NSRange epos = [privateKey rangeOfString:@"-----END RSA PRIVATE KEY-----"];
    if(spos.location != NSNotFound && epos.location != NSNotFound){
        NSUInteger s = spos.location + spos.length;
        NSUInteger e = epos.location;
        NSRange range = NSMakeRange(s, e-s);
        privateKey = [privateKey substringWithRange:range];
    }
    
    //除去换行符，空格等
    privateKey = [privateKey stringByReplacingOccurrencesOfString:@"\r" withString:@""];
    privateKey = [privateKey stringByReplacingOccurrencesOfString:@"\n" withString:@""];
    privateKey = [privateKey stringByReplacingOccurrencesOfString:@"\t" withString:@""];
    privateKey = [privateKey stringByReplacingOccurrencesOfString:@" "  withString:@""];
    
    // ras私钥
    NSMutableString * rsa_private_key = [[NSMutableString alloc]initWithString:privateKey];
    [rsa_private_key insertString:@"-----BEGIN RSA PRIVATE KEY-----\n" atIndex:0];
    [rsa_private_key appendString:@"\n-----END RSA PRIVATE KEY-----\n"];
    
    BIO *bio = NULL;
    const char * chPrivateKey =[rsa_private_key UTF8String];
    if ((bio = BIO_new_mem_buf(chPrivateKey, -1)) == NULL)       //从字符串读取RSA公钥
    {
        return nil;
    }
    
    RSA *rsa= PEM_read_bio_RSAPrivateKey(bio, NULL, NULL, NULL);
    
    return rsa;
    
}


//私钥解密
+ (NSData *)decryptData:(NSData *)data withPrivateRSA:(RSA *)privateRSA {
    
    if (!privateRSA) {
        return nil;
    }
    
    int privateRSALenght = RSA_size(privateRSA);
    double totalLength = [data length];
    int blockSize = privateRSALenght;
    int blockCount = ceil(totalLength / blockSize);
    NSMutableData *decrypeData = [NSMutableData data];
    for (int i = 0; i < blockCount; i++) {
        NSUInteger loc = i * blockSize;
        long dataSegmentRealSize = MIN(blockSize, totalLength - loc);
        NSData *dataSegment = [data subdataWithRange:NSMakeRange(loc, dataSegmentRealSize)];
        const unsigned char *str = [dataSegment bytes];
        unsigned char *privateDecrypt = malloc(privateRSALenght);
        memset(privateDecrypt, 0, privateRSALenght);
        if(RSA_ossl_private_decrypt_sha256(privateRSALenght,str,privateDecrypt,privateRSA,RSA_PKCS1_OAEP_PADDING)>=0){
            NSInteger length =strlen((char *)privateDecrypt);
            NSData *data = [[NSData alloc] initWithBytes:privateDecrypt length:length];
            [decrypeData appendData:data];
            
        }
        free(privateDecrypt);
    }
    
    RSA_free(privateRSA);
    return decrypeData;
}

#pragma 解密
+ (NSData *) decryptString:(NSString *)encryptContent withPrivateKey:(NSString *)privateKey{
    //解密
    RSA *privateRSA=[self createRsaKeyWithPrivateKey:privateKey];
    NSData *encodeData = [[NSData alloc] initWithBase64EncodedString:encryptContent options:NSDataBase64DecodingIgnoreUnknownCharacters];
    
    NSData *data=[self decryptData:encodeData withPrivateRSA:privateRSA];
    return data;
}


@end
