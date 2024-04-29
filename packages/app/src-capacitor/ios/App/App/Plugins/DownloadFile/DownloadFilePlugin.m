//
//  SeafilePlugin.m
//  App
//
//  Created by gjm on 8/10/23.
//

#import <Capacitor/Capacitor.h>

CAP_PLUGIN(DownloadFilePlugin, "DownloadFilePlugin",
    CAP_PLUGIN_METHOD(test, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(download, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(isDownloaded, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(updateDownloadSavePathByNewName, CAPPluginReturnPromise);
)

