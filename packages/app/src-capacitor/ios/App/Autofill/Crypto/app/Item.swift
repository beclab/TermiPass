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

typealias VaultItemID = String
typealias Tag = String

public class Field: HandyJSON {
    var type: FieldType = .Text
    var name = ""
    var value = ""

    required public init() {}
}

public class VaultItem :HandyJSON {
    
    var id: VaultItemID = ""
    
    var name = ""
    
    var icon: String?
    
    var fields: [Field] = []
    
    var tags: [Tag] = []
    
    var updated: Date?
    
    var updatedBy: AccountID = ""
    
    required public init() {}
}
