//
//  OpenSSLTool.h
//  App
//
//  Created by gjm on 2023/2/15.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface OpenSSLTool : NSObject

+ (NSData *) decryptString:(NSString *)encryptContent withPrivateKey:(NSString *)privateKey;

@end

NS_ASSUME_NONNULL_END
