//
//  ExtensionWebview.m
//  App
//
//  Created by gjm on 2023/4/14.
//

#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>
CAP_PLUGIN(ExtensionWebviewPlugin, "ExtensionWebview",
    CAP_PLUGIN_METHOD(open, CAPPluginReturnPromise);
)
