//
//  NSBundle+BTBundle.m
//  iOS_BTTrader
//
//  Created by 杨杨 on 2018/8/30.
//  Copyright © 2018年 yanglei. All rights reserved.
//

#import "NSBundle+BTBundle.h"

@implementation NSBundle (BTBundle)

+ (instancetype)btBundle {
    
     NSBundle *bundle = [NSBundle bundleWithPath:[[NSBundle mainBundle] pathForResource:@"BundleResources" ofType:@"bundle"]];
    
    if(bundle == nil) {
        NSLog(@"bundle is nil 请添加BundleResources包");
    }
    
    return bundle;
    
}

+ (instancetype)bundleWithName:(NSString *)bundleName {
    NSBundle *bundle = [NSBundle bundleWithPath:[[NSBundle mainBundle] pathForResource:bundleName ofType:@"bundle"]];
    
    if(bundle == nil) {
        NSLog(@"bundle is nil 请添加%@包",bundleName);
    }
    
    return bundle;
}

@end
