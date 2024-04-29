//
//  App.swift
//  App
//
//  Created by gjm on 2023/2/13.
//

import Foundation
import HandyJSON
open class AppState: HandyJSON {
    var id = "app-state"
    
    var account: Account?
        
    public var vaults: [Vault] = []
    
    required public init() {}
}


open class App {
    var version = "3.0";
    public var state: AppState?
    
    
    public func load(appState: AppState) {
        self.state = appState
    }
    
    
    public func account() -> Account? {
        return self.state?.account
    }
    
    public func unlock(password: String) throws {
        guard let account = self.account() else { throw Error.paramsError }
        try account.unlock(password: password)
//
        if let state = self.state {
            if state.vaults != nil && state.vaults.count > 0 {
                try state.vaults.forEach { vault in
                    try vault.unlock(account: account)
                }
            }
        }
       
    }
    
    public func storageId(userid: String?) -> String {
//         guard let state = self.state else{
//            return "\("AppState".lowercased())"
//        }
        
        guard let userid = userid else { return "app-state" }
        
        return "app-state-\(userid)"
    }
    
    public init() {
        
    }
}
