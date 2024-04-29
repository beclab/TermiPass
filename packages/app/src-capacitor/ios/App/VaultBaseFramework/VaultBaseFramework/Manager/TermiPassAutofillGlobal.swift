//
//  AppTools.swift
//  App
//
//  Created by gjm on 2023/2/8.
//

import Foundation

let autoFillStorage = "aoto_fill_storage"

let autoFillListKey = "auto_fill_list"

open class AutoFillStorage {
    public static func setWebsite(website: String) {
        if var autoFillList = TermiPassBaseStorage.getData(key: autoFillListKey, rootKey: autoFillStorage) as? [String]{
            autoFillList.append(website)
            TermiPassBaseStorage.setData(key: autoFillListKey, value: autoFillList, rootKey: autoFillStorage)
        } else {
            TermiPassBaseStorage.setData(key: autoFillListKey, value: [website], rootKey: autoFillStorage)
        }
    }
    
    public static func getAllAutoFill() -> [String] {
        return TermiPassBaseStorage.getData(key: autoFillListKey, rootKey: autoFillStorage) as? [String] ?? []
    }
    
    
    public static func clearData() -> Void {
        TermiPassBaseStorage.clearData(rootKey: autoFillStorage)
    }
    
}

public enum UsersError : Swift.Error {
    case usersExit
}

let userStorageKey = "user_storage"

let localUserStoreId = "local-user-id"
let currentUserId = "current-user-id"
let localUsers = "users"
let openBiometric = "openBiometric"
let biometricServer = "biometric_server"

open class UserStore {
    
    static func getUserStoreId() -> String? {
        return self.getUsersStoreParams()[localUserStoreId] as? String
    }
    
    static func getCurrentUserId() -> String? {
        return self.getUsersStoreParams()[currentUserId] as? String
    }
    
    static func getUsers() -> String? {
        let result = self.getUsersStoreParams()[localUsers] as? String
        return result
    }
    
    
    static func getOpenBiometric() -> Bool {
        guard let openBiometric = self.getTotalUsers()[openBiometric]  else { return false }
        
        if let openBiometricValue = openBiometric as? Bool {
            return openBiometricValue
        }
        
        if let openBiometricValue = openBiometric as? String, openBiometricValue == "true" {
            return true
        }
        return false
    }
    
    public static func saveOpenBiometric(value: Bool) {
        self.save(key: openBiometric, value: value)
    }
    
    static func getBiometricServer() -> String? {
        return self.getUsersStoreParams()[biometricServer] as? String
    }
    
    static func getUsersStoreParams() -> [String:Any] {
        let result = UserStorage.getUsers()
        return result
    }
    
    static func getTotalUsers() -> [String: Any] {
        var dict = TermiPassBaseGlobal.standGlobal.autofillUserDefault?.dictionary(forKey: userStorageKey)
        if let storageDict = dict  {
            return storageDict
        }
        dict = [:]
        TermiPassBaseGlobal.standGlobal.autofillUserDefault?.set(dict, forKey: userStorageKey)
        self.userParamsSync(nil)
        return dict!
    }
    
    private static func save(key: String, value: Any) {
        var usersStorage = self.getTotalUsers()
        usersStorage[key] = value
        self.userParamsSync(usersStorage)
    }
    
    private static func userParamsSync (_ vaultStorage:[String:Any]?) {
        guard let storageDict = vaultStorage else {
            TermiPassBaseGlobal.standGlobal.autofillUserDefault?.synchronize()
            return
        }
        TermiPassBaseGlobal.standGlobal.autofillUserDefault?.set(storageDict, forKey: userStorageKey)
        TermiPassBaseGlobal.standGlobal.autofillUserDefault?.synchronize()
    }
}

@objc public enum AutoFillOpenHostAppType: Int {
    case Normal = 0
    case Add = 1
    
    public static func toOpenHostAppType(type: String) -> AutoFillOpenHostAppType  {
        return AutoFillOpenHostAppType(rawValue: Int(type) ?? 0) ?? .Normal
    }
}


@objc public class AppParamsUrlTools: NSObject {
    @objc public static let scheme = "didvault"
    @objc public static let host = "vault.com"
    @objc public static let type = "openType"
    @objc public static let identify = "identify"
}

