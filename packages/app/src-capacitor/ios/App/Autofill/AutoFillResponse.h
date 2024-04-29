//
//  AutoFillResponse.h
//  autofill
//
//  Created by gjm on 2023/2/8.
//

#import <Foundation/Foundation.h>
@import VaultBaseFramework;
@import UIKit;
NS_ASSUME_NONNULL_BEGIN

@interface AutoFillResponse : NSObject

+ (void)openHostAppWithVC:(UIViewController *)vc openType:(AutoFillOpenHostAppType)openType info:(nullable id)info;

@end

NS_ASSUME_NONNULL_END
