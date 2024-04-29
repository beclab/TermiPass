//
//  HookCapacitorHttpPlugin.m
//  App
//
//  Created by gjm on 6/14/23.
//

#import <Capacitor/Capacitor.h>

CAP_PLUGIN(HookCapacitorHttpPlugin, "HookCapacitorHttp",
  CAP_PLUGIN_METHOD(request, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(get, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(post, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(put, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(patch, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(delete, CAPPluginReturnPromise);
)
