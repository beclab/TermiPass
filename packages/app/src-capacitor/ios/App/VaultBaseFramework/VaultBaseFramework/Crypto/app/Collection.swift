//
//  Collection.swift
//  App
//
//  Created by gjm on 2023/2/13.
//

import Foundation
import HandyJSON
open class VaultItemCollection: HandyJSON {
    public required init() {
        
    }
    public var items: [String: VaultItem] = [:]
    var changes: [String: Date] = [:]
    
    public init(items: [VaultItem] = []) {
        items.forEach { item in
            self.items[item.id] = item
        }
    }
    
    func get(id: String) -> VaultItem? {
        return self.items[id]
    }
    
    func remove(items: [VaultItem]) {
        items.forEach { item in
            self.items.removeValue(forKey: item.id)
            self.changes[item.id] = Date()
        }
    }
    
    func merge(coll: VaultItemCollection) {
        
    }
    
    public func mapping(mapper: HelpingMapper) {
//        mapper.specify(property: &_items, name: "items")
        mapper <<<
            items <-- ItemsTransform()
    }
    
}


fileprivate class ItemsTransform: TransformType {
    
    public typealias Object = [String: VaultItem]
    public typealias JSON = [[String:Any]]
    
    public init() {}

    func transformFromJSON(_ value: Any?) -> [String : VaultItem]? {
        guard let formatValue = value as? [[String: Any]] else {
            return nil
        }
        var items : [String:VaultItem] = [:]
        formatValue.forEach { item in
            if let id = item["id"] {
                if let id = id as? String,let vaultItem = VaultItem.deserialize(from: item) {
                    items[id] = vaultItem
                }
            }
        }
        return items
    }
    
    func transformToJSON(_ value: [String : VaultItem]?) -> [[String : Any]]? {
        return nil
    }
}
