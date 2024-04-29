//
//  AppVersionPlugin.swift
//  App
//
//  Created by gjm on 2023/4/18.
//

import Capacitor
import VaultBaseFramework

@objc(AppNativeInfoPlugin)
public class AppNativeInfoPlugin: CAPPlugin {
    @objc func getInfo(_ call: CAPPluginCall) {
          
        let infoDictionary = Bundle.main.infoDictionary
        
        guard let majorVersion = infoDictionary?["CFBundleShortVersionString"] else {
            call.reject("get app version error")
            return
        }
        
        guard let appVersionCode = infoDictionary?["CFBundleVersion"] else {
            call.reject("get minor version error")
            return
        }
        
        call.resolve(["appVersionName": majorVersion,"appVersionCode":appVersionCode])
    }
}
