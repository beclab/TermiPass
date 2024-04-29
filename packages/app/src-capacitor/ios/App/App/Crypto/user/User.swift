//
//  User.swift
//  App
//
//  Created by gjm on 2023/2/9.
//

import Foundation
import HandyJSON
import CryptoSwift

public class UserItem: HandyJSON {
    var id = ""
    
    var mnemonic = ""
    
    var name = ""
    
    var url = ""
    
    var updated = ""
    
    required public init() {}
    
}

public class UserItemCollection : HandyJSON{
    var _items: [String:UserItem] = [:]
    
    func get(id: String) -> UserItem? {
        return self._items[id]
    }
    
    func update(items:[UserItem]) {
        items.forEach { item in
            self._items[item.id] = item
        }
    }
    
    func remove(items:[UserItem]) {
        items.forEach { item in
            self._items.removeValue(forKey: item.id)
        }
    }
    required public init() {}
    
}


public class LocalUserVault : PBES2Container {
    var id = ""
    
    var name = ""
    
    var created: Date?
    
    var updated: Date?
    
    var items = UserItemCollection()
    
    func setPassword(password: String) {
        if self.encryptedData != nil && self._key != nil {
            return
        }
        self._deriveAndSetKey(password: password)
                
        guard let jsonString = self.items.toJSON() else {
            return
        }
        print(jsonString)
        guard let data = try? JSONSerialization.data(withJSONObject: jsonString, options: [.prettyPrinted]) else {return}
        guard let backJson = try? JSONSerialization.jsonObject(with: data,options: [.mutableContainers]) else {return}
        print(backJson)
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
    
    override func _unlock(password: String) throws -> Data? {
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

public class LocalUserStore {
    var user: LocalUserVault?
    var id: String = ""
    var current_id = ""
    var openBiometric = false
    var biometricServer = ""
    
    func load() {
        
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
    
    func createUser(password: String, id: String, name: String, openBiometric: Bool = false, biometricServer: String) throws {
        let userId = UserStore.getUserStoreId()
        guard userId == nil else {
            throw UsersError.usersExit
        }
        
        self.id = id
        
        let user = LocalUserVault()
        user.id = id
        user.name = name
        user.created = Date()
        user.updated = Date()

        user.setPassword(password: password)
        
        self.user = user;
        
        self.openBiometric = openBiometric
        
        UserStore.saveUserStoreId(value: id)
        UserStore.saveOpenBiometric(value: openBiometric)
        UserStore.saveBiometricServer(value: biometricServer)
        
        self.save()
        
    }
    
    func addUser(id: String, name: String, mnemonic: String) {
        guard let user = self.user else { return }
        if user.locked() {
            return
        }
        
        let item = UserItem()
        item.name = name
        item.id = id
        item.mnemonic = mnemonic
        user.items.update(items: [item])
        user.commit()
        
        UserStore.saveCurrentUserId(value: id)
        
        self.save()
    }
    
    func save() {
        
        guard let user = self.user else { return }
        
        guard let jsonString = user.toJSON() else {
            return
        }
        print(jsonString)
        UserStore.saveUsers(value: jsonString)
    }
}
