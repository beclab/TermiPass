//
//  TwitterLoginPlugin.m
//  App
//
//  Created by gjm on 2023/1/6.
//

#import <Capacitor/Capacitor.h>
CAP_PLUGIN(TwitterLoginPlugin, "TwitterLogin",
    CAP_PLUGIN_METHOD(login, CAPPluginReturnPromise);
)
