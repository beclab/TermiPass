//
//  DNSServer.swift
//  VpnTunnel
//
//  Created by gjm on 8/10/23.
//

import Foundation
import Network

public struct DNSServer {
    public let address: IPAddress

    public init(address: IPAddress) {
        self.address = address
    }
}

extension DNSServer: Equatable {
    public static func == (lhs: DNSServer, rhs: DNSServer) -> Bool {
        return lhs.address.rawValue == rhs.address.rawValue
    }
}

extension DNSServer {
    public var stringRepresentation: String {
        return "\(address)"
    }

    public init?(from addressString: String) {
        if let addr = IPv4Address(addressString) {
            address = addr
        } else if let addr = IPv6Address(addressString) {
            address = addr
        } else {
            return nil
        }
    }
}
