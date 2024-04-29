//
//  TunnelConfiguration.swift
//  VpnTunnel
//
//  Created by gjm on 8/10/23.
//

import Foundation

public final class TunnelConfiguration {
    public var name: String?
    public let peers: [PeerConfiguration]
    public var interface: InterfaceConfiguration

    public init(name: String?,interface: InterfaceConfiguration , peers: [PeerConfiguration]) {
        self.peers = peers
        self.name = name
        self.interface = interface
    }
}

extension TunnelConfiguration: Equatable {
    public static func == (lhs: TunnelConfiguration, rhs: TunnelConfiguration) -> Bool {
        return lhs.name == rhs.name &&
        lhs.interface == rhs.interface &&
            Set(lhs.peers) == Set(rhs.peers)
    }
}

public class PeerConfiguration {
    public var allowedIPs = [IPAddressRange]()
}

extension PeerConfiguration: Equatable {
    public static func == (lhs: PeerConfiguration, rhs: PeerConfiguration) -> Bool {
        return
            Set(lhs.allowedIPs) == Set(rhs.allowedIPs)
    
    }
}


extension PeerConfiguration: Hashable {
    public func hash(into hasher: inout Hasher) {
        hasher.combine(Set(allowedIPs))
    }
}
