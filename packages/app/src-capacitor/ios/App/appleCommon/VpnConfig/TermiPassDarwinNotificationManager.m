//
//  PTDarwinNotificationManager.m
//  VpnTunnel
//
//  Created by gjm on 7/20/23.
//

#import "TermiPassDarwinNotificationManager.h"

@implementation TermiPassDarwinNotificationManager {
    NSMutableDictionary<NSString *, TermiPassDarwinNotificationManagerHandler> *handlers;
}

+ (instancetype)sharedInstance {
    static id instance = NULL;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        instance = [[self alloc] init];
    });
    return instance;
}

- (instancetype)init {
    self = [super init];
    if (self) {
        handlers = [NSMutableDictionary new];
    }
    return self;
}

- (void)registerNotificationForName:(NSString *)name callback:(TermiPassDarwinNotificationManagerHandler)callback {
    handlers[name] = callback;
    CFNotificationCenterRef center = CFNotificationCenterGetDarwinNotifyCenter();
    CFNotificationCenterAddObserver(center, (__bridge const void *)(self), defaultNotificationCallback, (__bridge CFStringRef)name, NULL, CFNotificationSuspensionBehaviorDeliverImmediately);
}

- (void)postNotificationForName:(NSString *)name {
    CFNotificationCenterRef center = CFNotificationCenterGetDarwinNotifyCenter();
    CFNotificationCenterPostNotification(center, (__bridge CFStringRef)name, NULL, NULL, YES);
}

static void defaultNotificationCallback(CFNotificationCenterRef center,
                                        void *observer,
                                        CFStringRef name,
                                        const void *object,
                                        CFDictionaryRef userInfo) {
    NSString *identifier = (__bridge NSString *)name;
    TermiPassDarwinNotificationManagerHandler handler = [TermiPassDarwinNotificationManager sharedInstance]->handlers[identifier];
    if (handler) {
        handler();
    }
}

- (void)dealloc {
    CFNotificationCenterRef center = CFNotificationCenterGetDarwinNotifyCenter();
    CFNotificationCenterRemoveEveryObserver(center, (__bridge const void *)(self));
}


@end
