//
//  NSBundle+BTBundle.h
//  iOS_BTTrader
//
//  Created by 杨杨 on 2018/8/30.
//  Copyright © 2018年 yanglei. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface NSBundle (BTBundle)

+ (instancetype)btBundle;

+ (instancetype)bundleWithName:(NSString *)bundleName;

@end
