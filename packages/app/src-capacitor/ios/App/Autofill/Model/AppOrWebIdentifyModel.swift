//
//  AppOrWebIdentifyModel.swift
//  autofill
//
//  Created by gjm on 2023/2/16.
//

import Foundation
import VaultBaseFramework

public struct VaultFilter {
    var vault: Vault
    var item: VaultItem
    
    func filterPasswordAndUserName() -> (vaultName: String, itemName: String, username: String, password: String, url: String) {
        
        var password = ""
        var username = ""
        var url = ""
        
        self.item.fields.forEach { field in
            if field.type == FieldType.Username {
                username = field.value
            }
            if field.type == FieldType.Password {
                password = field.value
            }
            if field.type == FieldType.Url {
                url = field.value
            }
        }
        
        
        return (self.vault.name, self.item.name, username, password, url)
    }
    static func filterInfoById(id: String) -> (vaultName: String, itemName: String, username: String, password: String, url: String) {
        guard let state = autoFillapp.state else { return ("","","","","") }
        
        
        for vault in state.vaults {
            for (_, vaultItem) in vault.items.items {
                if vaultItem.id == id {
                    return VaultFilter(vault: vault, item: vaultItem).filterPasswordAndUserName()
                }
            }
        }
        
        return ("", "","","","")
    }
}

public enum IdentifyType: Int {
    case app = 0
    case web = 1
    
    func loginFilter(identify: String) -> [VaultFilter] {
        
        guard let state = autoFillapp.state else { return [] }
        
        if self.rawValue > 1 {
            return []
        }
        
        var newIdentify = identify
        
        if self == .web {
            if let url = URL(string: identify) {
                newIdentify = url.host ?? identify
            }
        }
        
        var filterResult: [VaultFilter] = []
        
        state.vaults.forEach { vault in
            for (_, vaultItem) in vault.items.items {
                let password = vaultItem.fields.first { filed in
                    filed.type == FieldType.Password
                }
                let userName = vaultItem.fields.first { filed in
                    filed.type == FieldType.Username
                }
                
                if password != nil && userName != nil {
                    //
                    let content = vaultItem.fields.map { filed in
                        return [filed.name,filed.value].joined(separator: " ")
                    }.joined(separator: " ").lowercased()
                    
                    if content.contains(newIdentify.lowercased()) {
                        filterResult.append(VaultFilter(vault: vault, item: vaultItem))
                    }
                }
            }
        }
        
        return filterResult
    }
}

extension VaultItem {
    func filterPasswordAndUserName() -> (vaultName: String,username: String, password: String, url: String) {
        
        var password = ""
        var username = ""
        var url = ""
        
        self.fields.forEach { field in
            if field.type == FieldType.Username {
                username = field.value
            }
            if field.type == FieldType.Password {
                password = field.value
            }
            if field.type == FieldType.Url {
                url = field.value
            }
        }
        
        
        return (self.name,username,password,url)
    }
    static func filterInfoById(id: String) -> (vaultName: String,username: String, password: String, url: String) {
        guard let state = autoFillapp.state else { return ("","","","") }
        
        
        for vault in state.vaults {
            for (_, vaultItem) in vault.items.items {
                if vaultItem.id == id {
                    return vaultItem.filterPasswordAndUserName()
                }
            }
        }
        
        return ("","","","")
    }
}

public struct AppOrWebIdentifyModel {
    
    let identifier: String
    
    let type: IdentifyType
}

public let autoFillapp = App()
