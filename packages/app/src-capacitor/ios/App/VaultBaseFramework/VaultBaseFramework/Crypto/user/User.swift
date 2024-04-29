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
    
    public var mnemonic = ""
    
    var name = ""
    
    var url = ""
    
    var updated = ""
    
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


open class LocalUserVault : PBES2Container {
    var id = ""
    
    var name = ""
    
    var created: Date?
    
    var updated: Date?
    
    public var items = UserItemCollection()
    
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
                if let items = UserItemCollection.deserialize(from: str) {
                    self.items = items
                }
            }
        }
        return data
    }
    
    public override func mapping(mapper: HelpingMapper) {
        super.mapping(mapper: mapper)
        mapper.exclude(property: &items)
        mapper <<<
            updated <--  DateTransform()//CustomDateFormatTransform(formatString: "yyyy-MM-dd HH:mm:ss")
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
        
        os_log("%{public}s", log: OSLog.default, type: .default, "load start")
        
        guard let id = UserStore.getUserStoreId() else {
            return
        }
        
        os_log("%{public}s", log: OSLog.default, type: .default, "id:\(id)")
        
        self.id = id;
        
        guard let current_id = UserStore.getCurrentUserId() else {
            return
        }
        
        self.current_id = current_id
        
        os_log("%{public}s", log: OSLog.default, type: .default, "current_id:\(current_id)")
        
        guard let users = UserStore.getUsers() else {
            os_log("%{public}s", log: OSLog.default, type: .default, "users empty")
            return
        }
            
        os_log("%{public}s", log: OSLog.default, type: .default, "users:\(users)")
    
        if let _user = LocalUserVault.deserialize(from: users) {
            self.user = _user
        }
        
        self.openBiometric = UserStore.getOpenBiometric();
        
        guard let biometricServer = UserStore.getBiometricServer() else {
            return
        }
        
        self.biometricServer = biometricServer
    }
    
//    public func createUser(password: String, id: String, name: String, openBiometric: Bool = false, biometricServer: String) throws {
//        let userId = UserStore.getUserStoreId()
//        guard userId == nil else {
//            throw UsersError.usersExit
//        }
//
//        self.id = id
//
//        let user = LocalUserVault()
//        user.id = id
//        user.name = name
//        user.created = Date()
//        user.updated = Date()
//
//        user.setPassword(password: password)
//
//        self.user = user;
//
//        self.openBiometric = false
//
//        UserStore.saveUserStoreId(value: id)
//        UserStore.saveOpenBiometric(value: false)
//        UserStore.saveBiometricServer(value: biometricServer)
//        self.save()
//    }
    
//    public func addUser(id: String, name: String, mnemonic: String) {
//        guard let user = self.user else { return }
//        if user.locked() {
//            return
//        }
//
//        let item = UserItem()
//        item.name = name
//        item.id = id
//        item.mnemonic = mnemonic
//        user.items.update(items: [item])
//        user.commit()
//        UserStore.saveCurrentUserId(value: id)
//        self.save()
//    }
    
//    public func save() {
//        guard let user = self.user else { return }
//        
//        guard let jsonString = user.toJSON() else {
//            return
//        }
//        UserStore.saveUsers(value: jsonString)
//    }
}
