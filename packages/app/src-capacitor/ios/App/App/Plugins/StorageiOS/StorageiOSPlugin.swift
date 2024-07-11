//
//  StorageiOSPlugin.swift
//  App
//
//  Created by gjm on 2023/2/9.
//

import Foundation
import Capacitor
import VaultBaseFramework

@objc(StorageiOSPlugin)
public class StorageiOSPlugin: CAPPlugin, CAPBridgedPlugin {
    
    public let identifier = "StorageiOSPlugin"
    public let jsName = "StorageiOS"
    
    public var pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "set", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "get", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "delete", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "clear", returnType: CAPPluginReturnPromise)
        
    ]
    
    @objc func set(_ call: CAPPluginCall) {
        let key = call.getString("key") ?? ""
        let value = call.getAny("value") ?? {}
        VaultStorage.setData(key: key, value: value)
        call.resolve()
    }
    
    @objc func get(_ call: CAPPluginCall) {
        let key = call.getString("key") ?? ""
        let value = VaultStorage.getData(key: key)
        call.resolve([
            "value": value
        ])
    }
    
    @objc func delete(_ call: CAPPluginCall) {
        let key = call.getString("key") ?? ""
        VaultStorage.removeData(key: key)
        call.resolve()
    }
    
    @objc func clear(_ call: CAPPluginCall) {
        VaultStorage.clearData()
        call.resolve()
    }
}
