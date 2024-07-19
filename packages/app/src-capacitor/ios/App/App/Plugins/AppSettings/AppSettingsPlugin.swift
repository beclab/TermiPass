//
//  AppStatusUpdatePlugin.swift
//  App
//
//  Created by gjm on 2023/2/8.
//

import Capacitor
import VaultBaseFramework

@objc(AppSettingsPlugin)
public class AppSettingsPlugin: CAPPlugin, CAPBridgedPlugin {
    
    public let identifier = "AppSettingsPlugin"
    public let jsName = "AppSettingsPlugin"
    
    public var pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "showAllowCrossSiteTracking", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "jumpToAppSettings", returnType: CAPPluginReturnNone)
    ]
    
    private static let key: String = "AllowCrossSiteTrackingHadShow"
    
    @objc func showAllowCrossSiteTracking(_ call: CAPPluginCall) {
        UserDefaults.standard.synchronize()
        let defaults = UserDefaults.standard
        let value = !defaults.bool(forKey: AppSettingsPlugin.key)
        
        if (value) {
            UserDefaults.standard.setValue(true, forKey: AppSettingsPlugin.key)
        }
        
        call.resolve([
            "value": value
        ])
    }
    
    @objc func jumpToAppSettings(_ call: CAPPluginCall) {
        guard let url = URL(string: UIApplication.openSettingsURLString) else { return }
        
        DispatchQueue.main.async {
            UIApplication.shared.open(url)
        }
    }
}
