//
//  DropboxPlugin.m
//  App
//
//  Created by gjm on 6/18/24.
//

#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(DropboxAuthPlugin, "DropboxAuthPlugin",
    CAP_PLUGIN_METHOD(initialize, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(signIn, CAPPluginReturnPromise);
)
