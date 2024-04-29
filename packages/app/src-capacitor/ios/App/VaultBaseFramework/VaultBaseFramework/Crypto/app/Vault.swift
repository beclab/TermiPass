//
//  File.swift
//  App
//
//  Created by gjm on 2023/2/13.
//

import Foundation
import HandyJSON

typealias VaultID = String

open class Vault: SharedContainer{
    
    var id: VaultID = ""
    
    public var name = ""
    
    var owner: AccountID = ""
    
    var created: Date?
    
    var updated: Date?
    
    var revision = ""
    
    
    public var items = VaultItemCollection()
    
    
    func label() -> String {
        return self.name
    }
    
    func unlock(account: Account) throws {
        if self.accessors.count == 0 {
//            try self.updateAccessors(subjects: [(account.id,account.publicKey)])
//            try self.commit()
        } else {
            if let privateKey = account.privateKey {
                try super.unlock(id: account.id, privateKey: privateKey)
                 guard let data = try self.getData() else {
                    return
                }
                let jsonData = try HandjsonUtil.jsonDataToModel(data: data)
                
                if let jsonData = jsonData as? [String : Any] {
                    if let deserializeItems =  VaultItemCollection.deserialize(from: jsonData) {
                        self.items = deserializeItems
                    }
                }
                
            }
        }
    }
    
    func commit() throws {
//        let data = try HandjsonUtil.toJsonData(object: self.items)
//        self.setData(data: data)
    }
}
