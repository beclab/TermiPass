//
//  AppVersionPlugin.m
//  App
//
//  Created by gjm on 2023/4/19.
//

#import <Capacitor/Capacitor.h>

CAP_PLUGIN(AppNativeInfoPlugin, "AppNativeInfo",
    CAP_PLUGIN_METHOD(getInfo, CAPPluginReturnPromise);
)
