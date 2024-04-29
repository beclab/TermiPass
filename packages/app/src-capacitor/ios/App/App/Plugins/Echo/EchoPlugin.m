//
//  EchoPlugin.m
//  App
//
//  Created by gjm on 2022/12/30.
//

#import <Capacitor/Capacitor.h>

CAP_PLUGIN(EchoPlugin, "Echo",
    CAP_PLUGIN_METHOD(echo, CAPPluginReturnPromise);
)
