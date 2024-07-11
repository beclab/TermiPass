//
//  TermiPassVaultGlobal.swift
//  VaultBaseFramework
//
//  Created by gjm on 8/10/23.
//

import Foundation

enum AppStatus {
    case inited
    case locked
    case unlocked
}


let vaultRootStorageKey = "vault_root_storage"

let userRootStorageKey = "user_root_storage"

let configRootStorageKey = "config_root_storage"


open class VaultStorage {
    
    public static func setData(key: String, value: Any) {
        TermiPassBaseStorage.setData(key: key, value: value, rootKey: vaultRootStorageKey)
    }
    
    public static func getData(key: String) -> Any {
        return TermiPassBaseStorage.getData(key: key  , rootKey: vaultRootStorageKey)
    }
    
    
    public static func removeData(key: String) -> Void {
        TermiPassBaseStorage.removeData(key: key, rootKey: vaultRootStorageKey)
    }
    
    public static func clearData() -> Void {
        TermiPassBaseStorage.clearData(rootKey: vaultRootStorageKey)
    }
    
    static func getVault() -> [String:Any] {
        return TermiPassBaseStorage.getStorage(rootKey: vaultRootStorageKey)
    }
    
}

open class UserStorage {
    public static func setData(key: String, value: Any) {
        TermiPassBaseStorage.setData(key: key, value: value, rootKey: userRootStorageKey)
    }
    
    public static func getData(key: String) -> Any {
        return TermiPassBaseStorage.getData(key: key, rootKey: userRootStorageKey)
    }
    
    
    public static func removeData(key: String) -> Void {
        TermiPassBaseStorage.removeData(key: key, rootKey: userRootStorageKey)
    }
    
    public static func clearData() -> Void {
        TermiPassBaseStorage.clearData(rootKey: userRootStorageKey)
    }
    
    static func getUsers() -> [String:Any] {
        return TermiPassBaseStorage.getStorage(rootKey: userRootStorageKey)
    }
}


open class ConfigStorage {
    
    public static func setData(key: String, value: Any) {
        TermiPassBaseStorage.setData(key: key, value: value, rootKey: configRootStorageKey)
    }
    
    public static func getData(key: String) -> Any {
        return TermiPassBaseStorage.getData(key: key, rootKey: configRootStorageKey)
    }
    
    public static func getData<T>(key: String, defalt: T) -> T {
        let data = TermiPassBaseStorage.getData(key: key, rootKey: configRootStorageKey)
        
        if data.self as? any Any.Type == T.self {
            return data as! T
        }
        
        return defalt
    }
    
    public static func removeData(key: String) -> Void {
        TermiPassBaseStorage.removeData(key: key, rootKey: configRootStorageKey)
    }
    
    public static func clearData() -> Void {
        TermiPassBaseStorage.clearData(rootKey: configRootStorageKey)
    }
    
    static func getConfig() -> [String:Any] {
        return TermiPassBaseStorage.getStorage(rootKey: configRootStorageKey)
    }
    
}
