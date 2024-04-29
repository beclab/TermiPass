//
//  Crypto.swift
//  App
//
//  Created by gjm on 2023/2/9.
//

import Foundation
import HandyJSON

typealias AESKey = Array<UInt8>

protocol AlgorithmProtocol {
    func toString() -> String
}

public enum AESAlgorithm {
    case AES_GCM
    case AES_CCM
}

extension AESAlgorithm: AlgorithmProtocol {
    func toString() -> String {
        switch self {
        case .AES_GCM:
            return "AES-GCM"
        case .AES_CCM:
            return "AES-CCM"
        }
    }
}

public enum PBKDF2Algorithm {
    case PBKDF2
}

extension PBKDF2Algorithm: AlgorithmProtocol {
    func toString() -> String {
        switch self {
        case .PBKDF2:
            return "PBKDF2"
        }
    }
}

public enum SHAMode {
    case SHA_256
    
    func toString() -> String {
        switch self {
        case .SHA_256:
            return "SHA-256"
        }
    }
}

public enum Error: Swift.Error {
    case paramsError
    case systemError
}


public class AESEncryptionParams: HandyJSON{
    var algorithm: AESAlgorithm = .AES_GCM
    
    var tagSize = 128 /// 64 | 96 | 128
    
    var keySize = 256
    
    var iv:Data = Data()
    
    var additionalData: Data = Data()
    
    required public init() {}
    
    public func mapping(mapper: HelpingMapper) {
        mapper <<<
            iv <-- Base64DataTransform()
        mapper <<<
            additionalData <-- Base64DataTransform()
    }
}

let PBKDF2_ITER_DEFAULT:Int = Int(1e3)
//
public class PBKDF2Params : HandyJSON {
    //    var algorithm: PBKDF2Algorithm = .PBKDF2
    //    var hash: SHAMode = .SHA_256
    var keySize = 256 /// 256
    var iterations = PBKDF2_ITER_DEFAULT
    
    var salt: Data = Data()
    
    required public init() {}
    
    public func mapping(mapper: HelpingMapper) {
        mapper <<<
            salt <-- Base64DataTransform()
    }
}

protocol CryptoKeyParamsProtocal {
    var algorithm: String { get set }
    var keySize: Int {get set}
}

public class RSAKeyParams: HandyJSON, CryptoKeyParamsProtocal {
    var algorithm = "RSA"
    var modulusLength = 2048
    var hash = "SHA-256"
    var publicExponent = Data([0x01, 0x00, 0x01])
    var keySize = 256
    
    required public init() {}
    
    public func mapping(mapper: HelpingMapper) {
        mapper <<<
            publicExponent <-- Base64DataTransform()
    }
}

public class HMACKeyParams: HandyJSON, CryptoKeyParamsProtocal{
    var algorithm = "HMAC"
    var keySize = 256
    required public init() {}
}

public class AESKeyParams: HandyJSON, CryptoKeyParamsProtocal{
    var algorithm = "AES"
    var keySize = 256
    required public init() {}
}

public class RSAEncryptionParams: HandyJSON {
    var algorithm = "RSA-OAEP"
    var hash = "SHA-256"

    func getPadding() -> SecPadding {
        if self.algorithm == "RSA-OAEP" {
            return SecPadding.OAEP
        }
        return SecPadding.PKCS1
    }
    
    required public init() {
        
    }
}
