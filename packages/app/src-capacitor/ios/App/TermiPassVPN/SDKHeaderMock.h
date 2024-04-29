//// Objective-C API for talking to local_vpn_sdk/cmd/sdk Go package.
////   gobind -lang=objc local_vpn_sdk/cmd/sdk
////
//// File is generated by gobind. Do not edit.
//
//#ifndef __Local_vpn_sdk_H__
//#define __Local_vpn_sdk_H__
//
//@import Foundation;
//#include "ref.h"
//#include "Universe.objc.h"
//
//
//@protocol Local_vpn_sdkCallback;
//@class Local_vpn_sdkCallback;
//
//@protocol Local_vpn_sdkCallback <NSObject>
//- (void)init_:(NSString* _Nullable)s;
//- (void)log:(NSString* _Nullable)s;
//- (void)login:(NSString* _Nullable)s;
//- (NSString* _Nonnull)readString:(NSString* _Nullable)key;
//- (void)setRouter:(NSString* _Nullable)addr routers:(NSString* _Nullable)routers;
//- (void)writeString:(NSString* _Nullable)key value:(NSString* _Nullable)value;
//@end
//
//FOUNDATION_EXPORT void Local_vpn_sdkLogin(void);
//
//FOUNDATION_EXPORT void Local_vpn_sdkLogout(void);
//
//FOUNDATION_EXPORT void Local_vpn_sdkOnline(void);
//
//FOUNDATION_EXPORT void Local_vpn_sdkSDKInitFunc(long fd, long platform, NSString* _Nullable loginUrl, NSString* _Nullable authKey, id<Local_vpn_sdkCallback> _Nullable c);
//
//FOUNDATION_EXPORT void Local_vpn_sdkStart(void);
//
//FOUNDATION_EXPORT void Local_vpn_sdkStop(void);
//
//@class Local_vpn_sdkCallback;
//
//@interface Local_vpn_sdkCallback : NSObject <goSeqRefInterface, Local_vpn_sdkCallback> {
//}
//@property(strong, readonly) _Nonnull id _ref;
//
//- (nonnull instancetype)initWithRef:(_Nonnull id)ref;
//- (void)init_:(NSString* _Nullable)s;
//- (void)log:(NSString* _Nullable)s;
//- (void)login:(NSString* _Nullable)s;
//- (NSString* _Nonnull)readString:(NSString* _Nullable)key;
//- (void)setRouter:(NSString* _Nullable)addr routers:(NSString* _Nullable)routers;
//- (void)writeString:(NSString* _Nullable)key value:(NSString* _Nullable)value;
//@end
//
//#endif
//
