//
//  Account.swift
//  App
//
//  Created by gjm on 2023/2/10.
//

import Foundation
import HandyJSON


public typealias AccountID = String

struct MainVault: HandyJSON {
    var id = ""
    var name: String?
    var revision: String?
}

public class Account : PBES2Container {
    var id = ""
    var did = ""
    var name = ""
    
    var created: Date?
    
    var updated: Date?
    
    var publicKey = Data()
    
    var privateKey: Data? = Data()
    
    var signingKey: Data?
    
    var mainVault:MainVault = MainVault()
    
    var revision = ""
    
    func locked() -> Bool {
        return self.privateKey == nil || self.privateKey?.count == 0
    }
    
    func masterKey() -> Data? {
        return self._key
    }
    
    func setMasterKey(data: Data?) {
        self._key = data
    }
    

    func unlock(password: String) throws {
        _ = try super._unlock(password: password)
        try self._loadSecrets()
    }
    
    func _loadSecrets() throws {
        let data = try self.getData()
        if let data = data {
            let str = try? JSONSerialization.jsonObject(with: data,options: [.mutableContainers]);
            if let str = str as? [String: Any] {
                if let secrets = AccountSecrets.deserialize(from: str) {
                    self.privateKey = secrets.privateKey
                    self.signingKey = secrets.signingKey
                }
            }
        }
    }
    
    public override func mapping(mapper: HelpingMapper) {
        super.mapping(mapper: mapper)
        mapper.exclude(property: &privateKey)
        
        mapper <<<
            updated <--  CustomDateFormatTransform(formatString: "yyyy-MM-dd'T'HH:mm:ss")
        mapper <<<
            created <--  CustomDateFormatTransform(formatString: "yyyy-MM-dd'T'HH:mm:ss")
        mapper <<<
            publicKey <-- Base64DataTransform()
    }
}

public class AccountSecrets: HandyJSON {
    public required init() {
        self.signingKey = Data()
        self.privateKey = Data()
    }
    
    var privateKey: Data
    
    var signingKey: Data
    
    init(privateKey: Data, signingKey: Data) {
        self.privateKey = privateKey
        self.signingKey = signingKey
    }
    
    public func mapping(mapper: HelpingMapper) {
        mapper <<<
            privateKey <-- Base64DataTransform()
        
        mapper <<<
            signingKey <-- Base64DataTransform()
    }
}
