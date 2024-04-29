//
//  StorageUseriOSPlugin.m
//  App
//
//  Created by gjm on 2023/3/3.
//

#import <Capacitor/Capacitor.h>

CAP_PLUGIN(StorageUseriOSPlugin, "StorageUseriOS",
    CAP_PLUGIN_METHOD(set, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(get, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(delete, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(clear, CAPPluginReturnPromise);
)
