//
//  ProxyInfoPlugin.m
//  App
//
//  Created by gjm on 8/10/23.
//

#import <Capacitor/Capacitor.h>

CAP_PLUGIN(ProxyInfoPlugin, "ProxyInfoPlugin",
    CAP_PLUGIN_METHOD(getServerInfo, CAPPluginReturnPromise);
)


