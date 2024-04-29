//
//  AutofilliOSPlugin.m
//  App
//
//  Created by gjm on 2023/4/26.
//

#import <Capacitor/Capacitor.h>

CAP_PLUGIN(AutofilliOSPlugin, "AutofilliOS",
    CAP_PLUGIN_METHOD(getAutofillList, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(clearAutofillList, CAPPluginReturnNone);
    CAP_PLUGIN_METHOD(replaceAllIdentities, CAPPluginReturnPromise);
)
