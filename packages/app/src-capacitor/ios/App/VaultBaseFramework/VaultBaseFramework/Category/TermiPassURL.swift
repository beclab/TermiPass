//
//  TermiPassURL.swift
//  VaultBaseFramework
//
//  Created by gjm on 8/10/23.
//

import Foundation

public extension URL {
    var urlParameters: [String: String]? {
        guard let components = URLComponents(url: self, resolvingAgainstBaseURL: true),
        let queryItems = components.queryItems else { return nil }
        return queryItems.reduce(into: [String: String]()) { (result, item) in
            result[item.name] = item.value
        }
    }
}
