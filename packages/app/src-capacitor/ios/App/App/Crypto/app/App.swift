//
//  App.swift
//  App
//
//  Created by gjm on 2023/2/13.
//

import Foundation
import HandyJSON
public class AppState: HandyJSON {
    var id = "app-state"
    
    var account: Account?
    
    var vaults: [Vault] = []
    
    required public init() {}
}


public class App {
    var version = "3.0";
    var state = AppState()
    
    
    func load(appState: AppState) {
        self.state = appState
    }
    
    
    func account() -> Account? {
        return self.state.account
    }
    
    func unlock(password: String) throws {
        guard let account = self.account() else { throw Error.paramsError }
        try account.unlock(password: password)
        
        try self.state.vaults.forEach { vault in
            try vault.unlock(account: account)
        }
        
        var vaults = self.state.vaults
        print(vaults)
    }
    
    func storageId() -> String {
        return "\("AppState".lowercased())_\(self.state.id)"
    }
}
