//
//  Item.swift
//  App
//
//  Created by gjm on 2023/2/13.
//

import Foundation
import HandyJSON

public enum FieldType: String {
    case Username = "username"
    case Password = "password"
    case Url = "url"
    case Email = "email"
    case Date = "date"
    case Month = "month"
    case Credit = "credit"
    case Phone = "phone"
    case Pin = "pin"
    case Totp = "totp"
    case Note = "note"
    case Text = "text"
    case CryptoeAddress = "cryptoaddress"
}

open class FieldTypeTransform: TransformType {
    public func transformFromJSON(_ value: Any?) -> FieldType? {
        guard let string = value as? String else {
            return nil
        }
        
        return FieldType(rawValue: string)
    }
    
    public func transformToJSON(_ value: FieldType?) -> String? {
        guard let value = value else {
            return nil
        }
        return value.rawValue
    }
    
    public typealias Object = FieldType
    public typealias JSON = String

    public init() {}


}


public typealias VaultItemID = String
typealias Tag = String

open class Field: HandyJSON {
    public var type: FieldType = .Text
    public var name = ""
    public var value = ""
    required public init() {}
    
    public func mapping(mapper: HelpingMapper) {
        mapper <<<
            type <-- FieldTypeTransform()
    }
}

open class VaultItem :HandyJSON {
    
    public var id: VaultItemID = ""
    
    public var name = ""
    
    var icon: String?
    
    public var fields: [Field] = []
    
    var tags: [Tag] = []
    
    var updated: Date?
    
    var updatedBy: AccountID = ""
    
    required public init() {}
}
