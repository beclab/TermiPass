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
public class StorageiOSPlugin: CAPPlugin {
    @objc func set(_ call: CAPPluginCall) {
        let key = call.getString("key") ?? ""
        let value = call.getAny("value") ?? {}
        VaultStorage.setData(key: key, value: value)
        call.resolve()
        
//    aclTags: [];
//    createdAt: string;
//    ephemeral: boolean;
//    expiration: string;
//    id: number;
//    key: string;
//    reusable: boolean;
//    used: boolean;
//    user: string;
        
//        {"reusable":true,"key":"ec3a3e09f8532b68f9b2e2dfaae3fe75ad8e4b5c34920302","id":"33","user":"default","used":false,"ephemeral":false,"expiration":"2033-09-05T11:50:03Z","createdAt":"2023-09-05T11:50:03.954897071Z","aclTags":[]}
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
