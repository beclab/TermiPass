//
//  ThemePlugin.m
//  App
//
//  Created by gjm on 7/11/24.
//

#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(ThemePlugin, "ThemePlugin",
           CAP_PLUGIN_METHOD(get, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(set, CAPPluginReturnPromise);
)
