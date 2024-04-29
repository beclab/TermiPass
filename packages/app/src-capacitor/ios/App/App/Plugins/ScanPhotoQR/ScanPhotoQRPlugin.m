//
//  ScanPhotoQRPlugin.m
//  App
//
//  Created by gjm on 2022/12/30.
//

#import <Capacitor/Capacitor.h>
CAP_PLUGIN(ScanPhotoQRPlugin, "ScanPhotoQR",
    CAP_PLUGIN_METHOD(scan, CAPPluginReturnPromise);
)
