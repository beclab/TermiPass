//
//  PTDarwinNotificationManager.h
//  VpnTunnel
//
//  Created by gjm on 7/20/23.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

typedef void(^TermiPassDarwinNotificationManagerHandler)(void);


@interface TermiPassDarwinNotificationManager : NSObject

+ (_Nonnull instancetype)sharedInstance;

- (void)registerNotificationForName:(NSString *_Nonnull)name callback:(TermiPassDarwinNotificationManagerHandler _Nullable)callback;

- (void)postNotificationForName:(NSString *_Nonnull)name;

@end

NS_ASSUME_NONNULL_END
