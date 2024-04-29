//
//  BaseContainer.swift
//  App
//
//  Created by gjm on 2023/2/9.
//

import Foundation
import CryptoSwift
import HandyJSON
import CryptoKit
import Security

open class BaseContainer : HandyJSON {
    var encryptionParams: AESEncryptionParams = AESEncryptionParams();
    var encryptedData: Data?
    var _key: Data?
    
    func setData(data: Data) {
        guard let _key = self._key else {
            return
        }
        self.encryptionParams.iv = Data(AES.randomIV(16))
        
        self.encryptionParams.additionalData = Data(AES.randomIV(16))
        
        let gcm = GCM(iv:  self.encryptionParams.iv.bytes,
                      additionalAuthenticatedData:self.encryptionParams.additionalData.bytes,
                      mode: .combined)
        let aes = try? AES(key: _key.bytes, blockMode: gcm, padding: .noPadding)
        
        let encryptedBytes = try? aes?.encrypt(data.bytes)
        
        if let newEncryptedBytes = encryptedBytes {
            encryptedData = Data(newEncryptedBytes)
        }
    }
    
    func getData() throws -> Data?  {
        guard let _key = self._key, let encryptedData = self.encryptedData else {
            throw Error.paramsError
        }
        
        let gcm = GCM(iv:  self.encryptionParams.iv.bytes,
                      authenticationTag: self.encryptionParams.additionalData.bytes,
                      additionalAuthenticatedData:self.encryptionParams.additionalData.bytes,
                      mode: .combined)
        guard  let aes = try? AES(key: _key.bytes, blockMode: gcm, padding: .noPadding) else {
            throw Error.paramsError
        }
        
        let decryptedBytes = try aes.decrypt(encryptedData.bytes)
        
        return Data(decryptedBytes)
    }
    
    func _lock() {
        self._key = nil
    }
    
    required public init() {}
    
    public func mapping(mapper: HelpingMapper) {
        mapper.exclude(property: &_key)
        mapper <<<
            encryptedData <-- Base64DataTransform()
    }
    
}

open class PBES2Container : BaseContainer {
    
    var keyParams = PBKDF2Params()
    
    func _deriveAndSetKey(password: String) {
        if self.keyParams.salt.count == 0 {
            self.keyParams.salt = Data(AES.randomIV(16))
        }
        let key = OpenSSLTool.pbkdf2(withPassword: password, salt: self.keyParams.salt, iterations: self.keyParams.iterations, keyLength: self.keyParams.keySize/8)
//        try? PKCS5.PBKDF2(password: password.bytes, salt: self.keyParams.salt.bytes, iterations: self.keyParams.iterations, keyLength: self.keyParams.keySize/8)
//
//        let keyCalculate = try? key?.calculate()
//        if let keyCalculate = keyCalculate {
//            self._key = Data(keyCalculate)
//        }
        self._key = key
    }
    
    public func _unlock(password: String) throws -> Data? {
        self._deriveAndSetKey(password: password)
        guard encryptedData != nil else { throw Error.paramsError }
        return try self.getData()
    }
    
    public override func mapping(mapper: HelpingMapper) {
        super.mapping(mapper: mapper)
    }
}

public class Accessor: HandyJSON {
    var id = ""
    var encryptedKey: Data = Data()
    var publicKey: Data?
    
    required public init() {
        
    }
    public func mapping(mapper: HelpingMapper) {
        mapper <<<
            encryptedKey <-- Base64DataTransform()
        mapper <<<
            publicKey <-- Base64DataTransform()
    }
}

open class SharedContainer: BaseContainer {
    var keyParams = RSAEncryptionParams()
    
    var accessors: [Accessor] = []
    
    func unlock(id: String, privateKey: Data) throws {
        guard self._key == nil else {
            return
        }
        
        let accessor = self.accessors.first { access in
            return access.id == id
        }
        
        guard let accessor = accessor else { throw Error.paramsError }
        
        self._key = try cryptoProvider.decrypt(privateKey: privateKey, data: accessor.encryptedKey, params: keyParams)
    }
    
    func updateAccessors(subjects:[(id: String, publicKey: Data)]) throws {
        
        var data: Data?
        
        if self.encryptedData != nil {
            if self._key == nil {
                throw Error.paramsError
            }
            data = try self.getData()
        }
        
        self._key = cryptoProvider.generateKey(params: AESKeyParams())
        
        if let data = data {
            self.setData(data: data)
        }
        guard let key = self._key else { return }
        self.accessors = try subjects.map({ item in
            let accessor = Accessor()
            accessor.id = item.id
            accessor.publicKey = item.publicKey
            accessor.encryptedKey = try cryptoProvider.encrypt(publicKey: item.publicKey, data: key, params: self.keyParams)
            return accessor
        })
        
    }
}


public class TestPBES2Container: PBES2Container {
    
    var items = "hello word"
    
    func setPassword(password: String) {
        if self.encryptedData != nil && self._key != nil {
            return
        }
        self._deriveAndSetKey(password: password)
        
        guard let data = try? JSONSerialization.data(withJSONObject: [self.items], options: [.prettyPrinted]) else {return}
        self.setData(data: data)
        
        
    }
    
    func testDe() {
        if self.encryptedData == nil || self._key == nil {
            return
        }
        
        guard let data = try? self.getData() else { return }
        
        guard let backJson = try? JSONSerialization.jsonObject(with: data,options: [.mutableContainers]) else {return}
        
        print(backJson)
    }
    
}
