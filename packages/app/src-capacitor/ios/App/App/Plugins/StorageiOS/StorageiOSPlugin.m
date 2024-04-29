//
//  StorageiOSPlugin.m
//  App
//
//  Created by gjm on 2023/2/9.
//


#import <Capacitor/Capacitor.h>

CAP_PLUGIN(StorageiOSPlugin, "StorageiOS",
    CAP_PLUGIN_METHOD(set, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(get, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(delete, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(clear, CAPPluginReturnPromise);
)
