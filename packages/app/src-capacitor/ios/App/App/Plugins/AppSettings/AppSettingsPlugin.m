//
//  AppStatusUpdatePlugin.m
//  App
//
//  Created by gjm on 2023/2/8.
//

#import <Capacitor/Capacitor.h>

CAP_PLUGIN(AppSettingsPlugin, "AppSettingsPlugin",
    CAP_PLUGIN_METHOD(showAllowCrossSiteTracking, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(jumpToAppSettings, CAPPluginReturnNone);
)
