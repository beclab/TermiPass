//
//  User.swift
//  App
//
//  Created by gjm on 2023/2/9.
//

import Foundation
import HandyJSON
import CryptoSwift
import os.log

open class UserItem: HandyJSON {
    var id = ""
    
//    public var mnemonic = ""
    
    var name = ""
    
    var url = ""
    
    var updated = ""
    
    required public init() {}
    
}

open class MnemonicItem: HandyJSON {
    var id = ""
    
    public var mnemonic = ""
    
    required public init() {}
    
}

open class UserItemCollection : HandyJSON{
    var items: [String:UserItem] = [:]
    
    public func get(id: String) -> UserItem? {
        return self.items[id]
    }
    
    func update(items:[UserItem]) {
        items.forEach { item in
            self.items[item.id] = item
        }
    }
    
    func remove(items:[UserItem]) {
        items.forEach { item in
            self.items.removeValue(forKey: item.id)
        }
    }
    required public init() {}
    public func mapping(mapper: HelpingMapper) {
        mapper <<<
            items <-- UserItemsTransform()
    }
}

open class MnemonicItemCollection : HandyJSON{
    var items: [String:MnemonicItem] = [:]
    
    public func get(id: String) -> MnemonicItem? {
        return self.items[id]
    }
    
    func update(items:[MnemonicItem]) {
        items.forEach { item in
            self.items[item.id] = item
        }
    }
    
    func remove(items:[MnemonicItem]) {
        items.forEach { item in
            self.items.removeValue(forKey: item.id)
        }
    }
    required public init() {}
    public func mapping(mapper: HelpingMapper) {
        mapper <<<
            items <-- MnemonicItemsTransform()
    }
}


fileprivate class UserItemsTransform: TransformType {
    
    public typealias Object = [String: UserItem]
    public typealias JSON = [[String:Any]]
    
    public init() {}

    func transformFromJSON(_ value: Any?) -> [String : UserItem]? {
        guard let formatValue = value as? [[String: Any]] else {
            return nil
        }
        var items : [String:UserItem] = [:]
        formatValue.forEach { item in
            if let id = item["id"] {
                if let id = id as? String,let vaultItem = UserItem.deserialize(from: item) {
                    items[id] = vaultItem
                }
            }
        }
        return items
    }
    
    func transformToJSON(_ value: [String : UserItem]?) -> [[String : Any]]? {
        return nil
    }
}

fileprivate class MnemonicItemsTransform: TransformType {
    
    public typealias Object = [String: MnemonicItem]
    public typealias JSON = [[String:Any]]
    
    public init() {}

    func transformFromJSON(_ value: Any?) -> [String : MnemonicItem]? {
        guard let formatValue = value as? [[String: Any]] else {
            return nil
        }
        var items : [String:MnemonicItem] = [:]
        formatValue.forEach { item in
            if let id = item["id"] {
                if let id = id as? String,let vaultItem = MnemonicItem.deserialize(from: item) {
                    items[id] = vaultItem
                }
            }
        }
        return items
    }
    
    func transformToJSON(_ value: [String : MnemonicItem]?) -> [[String : Any]]? {
        return nil
    }
}


open class LocalUserVault : PBES2Container {
    var id = ""
    
    var name = ""
    
    var created: Date?
    
    var updated: Date?
    
    public var items = UserItemCollection()
    
    public var mnemonics = MnemonicItemCollection()
    
    func setPassword(password: String) {
        if self.encryptedData != nil && self._key != nil {
            return
        }
        self._deriveAndSetKey(password: password)
                
        guard let jsonString = self.items.toJSON() else {
            return
        }
        guard let data = try? JSONSerialization.data(withJSONObject: jsonString, options: [.prettyPrinted]) else {return}
        self.setData(data: data)
        self.updated = Date()
    }
    
    func locked() -> Bool {
        return self._key == nil
    }
    
    func commit() {
        guard let jsonString = self.items.toJSON() else {
            return
        }
        guard let data = try? JSONSerialization.data(withJSONObject: jsonString, options: [.prettyPrinted]) else {return}
        self.setData(data: data)
        
    }
    
    override public func _unlock(password: String) throws -> Data? {
        let data = try super._unlock(password: password)
        if let data = data {
            let str = try? JSONSerialization.jsonObject(with: data,options: [.mutableContainers]);
            if let str = str as? [String: Any] {
                if let items = MnemonicItemCollection.deserialize(from: str) {
                    self.mnemonics = items
                }
            }
        }
        return data
    }
    
    public override func mapping(mapper: HelpingMapper) {
        super.mapping(mapper: mapper)
        mapper.exclude(property: &items)
        mapper <<<
            updated <--  DateTransform()
        mapper <<<
            created <--  DateTransform()
    }
}


public let standardUserStore = LocalUserStore()

open class LocalUserStore {
    public var user: LocalUserVault?
    public var id: String = ""
    public var current_id = ""
    public var openBiometric = false
    public var biometricServer = ""
    
    public func load() {
                
        guard let id = UserStore.getUserStoreId() else {
            return
        }
                
        self.id = id;
        
        guard let current_id = UserStore.getCurrentUserId() else {
            return
        }
        
        self.current_id = current_id
        
        
        guard let users = UserStore.getUsers() else {
            return
        }
                
        if let _user = LocalUserVault.deserialize(from: users) {
            self.user = _user
        }
        
        self.openBiometric = UserStore.getOpenBiometric();
        
        guard let biometricServer = UserStore.getBiometricServer() else {
            return
        }
        
        self.biometricServer = biometricServer
    }
}
