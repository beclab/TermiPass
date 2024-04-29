//
//  TermiPassVPNManager.h
//  TermiPassMacAddonFramework
//
//  Created by gjm on 9/1/23.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface TermiPassSDKVPNManager : NSObject

@property (nonatomic, copy, readonly) dispatch_block_t updateBlock;

+ (instancetype)sharedInstance;

- (void)openVpn:(NSString *)serverUrl authKey:(NSString *)authkey cookies:(NSString *)cookies;

- (void)close;

- (NSInteger)status;

- (void)setStatusUpdate:(dispatch_block_t)updateBlock;

- (NSString *)currentNodeId;

- (NSString *)peersState;

@end

NS_ASSUME_NONNULL_END
