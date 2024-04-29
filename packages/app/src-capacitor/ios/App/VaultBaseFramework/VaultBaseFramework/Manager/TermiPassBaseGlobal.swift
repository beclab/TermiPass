//
//  TermiPassBaseGlobal.swift
//  VaultBaseFramework
//
//  Created by gjm on 8/10/23.
//

import Foundation
//import IQKeyboardManagerSwift

public let fileGroupSuiName = "group.terminus.planeta.file"

public let autofillGroupSuiName = "group.terminus.planeta.autofill"

@objc public class TermiPassBaseGlobal: NSObject {
    
    @objc public static let standGlobal = TermiPassBaseGlobal()
    
    @objc public var fileGroupSuiNameStr: String {
        get {
            return fileGroupSuiName
        }
    }
    
    let autofillUserDefault = UserDefaults(suiteName: autofillGroupSuiName)
    
    let fileUserDefault = UserDefaults(suiteName: fileGroupSuiName)
    
    
    public func initManager() {
        configIQKeyboardManager()
        
        let rootURL = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: fileGroupSuiName)?.appendingPathComponent("termipass", isDirectory: true)
        if let rootURL = rootURL {
            TermiPassFileGlobal.standGlobal.register(rootPath: rootURL.path)
        }
    }
    
    func configIQKeyboardManager() {
//        IQKeyboardManager.shared.enable = true
//        IQKeyboardManager.shared.shouldResignOnTouchOutside = true
//        IQKeyboardManager.shared.shouldToolbarUsesTextFieldTintColor = true
//        IQKeyboardManager.shared.enableAutoToolbar = true
//        IQKeyboardManager.shared.keyboardDistanceFromTextField = 10
//        IQKeyboardManager.shared.toolbarDoneBarButtonItemText = "Complete"
    }
    
}


open class TermiPassBaseStorage {
    
    public static func setData(key: String, value: Any, rootKey: String) {
        var storage = self.getStorage(rootKey: rootKey)
        storage.removeValue(forKey: key)
        storage[key] = value
        self.storageSync(storage,rootKey: rootKey)
    }
    
    public static func getData(key: String, rootKey: String) -> Any {
        let storage = self.getStorage(rootKey: rootKey)
        return storage[key] ?? {}
    }
    
    public static func removeData(key: String, rootKey: String) -> Void {
        var storage = self.getStorage(rootKey: rootKey)
        storage.removeValue(forKey: key)
        self.storageSync(storage,rootKey: rootKey)
    }
    
    public static func clearData(rootKey: String) -> Void {
        self.storageSync([:],rootKey: rootKey)
    }
    
    public static func getStorage(rootKey: String) -> [String:Any] {
        var dict = TermiPassBaseGlobal.standGlobal.autofillUserDefault?.dictionary(forKey: rootKey)
        if let storageDict = dict  {
            return storageDict
        }
        dict = [:]
        TermiPassBaseGlobal.standGlobal.autofillUserDefault?.set(dict, forKey: rootKey)
        self.storageSync(nil, rootKey: rootKey)
        return dict!
    }
    
    
    public static func storageSync (_ infos:[String:Any]?, rootKey: String) {
        guard let infos = infos else {
            TermiPassBaseGlobal.standGlobal.autofillUserDefault?.synchronize()
            return
        }
        TermiPassBaseGlobal.standGlobal.autofillUserDefault?.set(infos, forKey: rootKey)
        TermiPassBaseGlobal.standGlobal.autofillUserDefault?.synchronize()
    }
}
