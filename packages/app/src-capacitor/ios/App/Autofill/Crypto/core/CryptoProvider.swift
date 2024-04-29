//
//  CryptoProvider.swift
//  App
//
//  Created by gjm on 2023/2/10.
//

import Foundation
import CryptoSwift
//import CryptoKit

public let cryptoProvider = CryptoProvider()

public class CryptoProvider {
    
    func generateKey(params: CryptoKeyParamsProtocal) -> Data {
        switch params.algorithm {
        case "AES","HMAC":
            return Data(AES.randomIV(params.keySize/8))
        default:
            return Data()
        }
    }
    
    func genrateKey(params: RSAKeyParams) throws -> (Data,Data) {
        return try RSAUtils.shared.generateRSAKeyPair(keySize: params.keySize)
    }
    
    func decrypt(privateKey: Data, data: Data, params: RSAEncryptionParams) throws -> Data {
        return try RSAUtils.shared.rsa_decrypt(data, privkey: privateKey, padding: params.getPadding())
    }
    
    func encrypt(publicKey: Data, data: Data, params: RSAEncryptionParams) throws -> Data {
        return try RSAUtils.shared.rsa_encrypt(data, publicKey: publicKey, padding: params.getPadding())
    }
    
}
