//
//  CryptoRSA.swift
//  App
//
//  Created by gjm on 2023/2/10.
//

import Foundation
import SwiftyRSA
import CryptoSwift

enum RSAKeySize: Int {
    case size512 = 512
    case size768 = 768
    case size1024 = 1024
    case size2048 = 2048
}

class RSAUtils {
    
    static let shared = RSAUtils()
    
    private let keySizeType: RSAKeySize = .size1024
    
    func generateRSAKeyPair(keySize: Int) throws -> (Data,Data)  {
        
        let keyPair = try SwiftyRSA.generateRSAKeyPair(sizeInBits: keySize)
        let privateKey = keyPair.privateKey
        let publicKey = keyPair.publicKey
        
        let publicKeyData = try publicKey.data()
        
        let privateKeyData = try privateKey.data()
        
        return (publicKeyData, privateKeyData)
    }
    
    func rsa_decrypt(_ decryptData:Data, privkey:Data, padding:SecPadding) throws -> Data{
        let resultData = OpenSSLTool.decryptString(decryptData.base64EncodedString(), withPrivateKey: privkey.base64EncodedString())
        return resultData
    }
    
    func rsa_encrypt(_ encryptData:Data, publicKey:Data, padding:SecPadding) throws -> Data{
        var resultData: Data = Data()
        do{
            let rsa_publicKey = try PublicKey(data: publicKey)
            let clear = ClearMessage(data: encryptData)
            resultData = try clear.encrypted(with: rsa_publicKey, padding: padding).data
            
        }catch{
            print("RSA加密失败")
            throw Error.paramsError
        }
        return resultData;
    }
    
    
}
