//
//  TailScalePlugin.m
//  App
//
//  Created by gjm on 9/5/23.
//

#import <Capacitor/Capacitor.h>

CAP_PLUGIN(TailScalePlugin, "TailScalePlugin",
    CAP_PLUGIN_METHOD(open, CAPPluginReturnNone);
    CAP_PLUGIN_METHOD(close, CAPPluginReturnNone);
    CAP_PLUGIN_METHOD(status, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(currentNodeId, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(peersState, CAPPluginReturnPromise);
)


