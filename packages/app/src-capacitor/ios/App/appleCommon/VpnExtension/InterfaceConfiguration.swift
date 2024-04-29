//
//  InterfaceConfiguration.swift
//  VpnTunnel
//
//  Created by gjm on 8/10/23.
//

import Foundation
import Network

public struct InterfaceConfiguration {
    public var addresses = [IPAddressRange]()
    public var mtu: UInt16?
    public var dns = [DNSServer]()
    public var dnsSearch = [String]()
}

extension InterfaceConfiguration: Equatable {
    public static func == (lhs: InterfaceConfiguration, rhs: InterfaceConfiguration) -> Bool {
        let lhsAddresses = lhs.addresses.filter { $0.address is IPv4Address } + lhs.addresses.filter { $0.address is IPv6Address }
        let rhsAddresses = rhs.addresses.filter { $0.address is IPv4Address } + rhs.addresses.filter { $0.address is IPv6Address }

        return
            lhsAddresses == rhsAddresses &&
            lhs.mtu == rhs.mtu &&
            lhs.dns == rhs.dns &&
            lhs.dnsSearch == rhs.dnsSearch
    }
}

