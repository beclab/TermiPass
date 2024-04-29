//
//  AutoFillResponse.m
//  autofill
//
//  Created by gjm on 2023/2/8.
//

#import "AutoFillResponse.h"

@implementation AutoFillResponse

+ (void)openHostAppWithVC:(UIViewController *)vc
                 openType:(AutoFillOpenHostAppType)openType
                     info:(nullable id)info {
    
    
    NSURLComponents *urlComponents = [[NSURLComponents alloc] init];
    urlComponents.scheme = AppParamsUrlTools.scheme;
    urlComponents.host = AppParamsUrlTools.host;
    NSString *query = [NSString stringWithFormat:@"%@=%ld",AppParamsUrlTools.type,(long)openType];
    if (openType == AutoFillOpenHostAppTypeAdd) {
        NSString *identify = [info objectForKey:AppParamsUrlTools.identify];
        query = [NSString stringWithFormat:@"%@&%@=%@",query,AppParamsUrlTools.identify,identify];
    }
    urlComponents.query = query;
    UIResponder *responder = vc;
    while (responder != nil) {
        if ([responder respondsToSelector:@selector(openURL:)]) {
            [responder performSelector:@selector(openURL:)
                            withObject:urlComponents.URL
                            afterDelay:0];
            return;
        }
        responder = [responder nextResponder];
    }
}

@end
