//
//  File.swift
//  App
//
//  Created by gjm on 2023/2/13.
//

import Foundation
import HandyJSON


open class Base64DataTransform: TransformType {
    public typealias Object = Data
    public typealias JSON = String

    public init() {}

    open func transformFromJSON(_ value: Any?) -> Data? {
        guard let string = value as? String else{
            return nil
        }
        
        return try? Data.decodeUrlSafeBase64(string)
    }

    open func transformToJSON(_ value: Data?) -> String? {
        guard let data = value else{
            return nil
        }
        return data.base64EncodedString()
    }
}


public extension Data {
    static func decodeUrlSafeBase64(_ value: String) throws -> Data {
        var stringtoDecode: String = value.replacingOccurrences(of: "-", with: "+")
        stringtoDecode = stringtoDecode.replacingOccurrences(of: "_", with: "/")
        switch (stringtoDecode.utf8.count % 4) {
            case 2:
                stringtoDecode += "=="
            case 3:
                stringtoDecode += "="
            default:
                break
        }
        guard let data = Data(base64Encoded: stringtoDecode, options: [.ignoreUnknownCharacters]) else {
            throw NSError(domain: "decodeUrlSafeBase64", code: 1,
                        userInfo: [NSLocalizedDescriptionKey: "Can't decode base64 string"])
        }
        return data
    }
}
