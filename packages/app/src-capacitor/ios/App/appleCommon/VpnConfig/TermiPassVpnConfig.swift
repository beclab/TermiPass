//
//  PTVpnConfig.swift
//  VpnTunnel
//
//  Created by gjm on 7/20/23.
//

import Foundation
import NetworkExtension
import os

@objc public extension TermiPassVpnManager {
    
    @objc enum Status: Int {
        case off = 0
        case on = 1
        case invalid = 2 /// The VPN is not configured
        case connecting = 3
        case disconnecting = 4
        
        public init(_ status: NEVPNStatus) {
            switch status {
            case .connected:
                self = .on
            case .connecting, .reasserting:
                self = .connecting
            case .disconnecting:
                self = .disconnecting
            case .disconnected, .invalid:
                self = .off
            @unknown default:
                self = .off
            }
        }
    }
}

 @objc extension TermiPassVpnManager {
    @objc public class Config: NSObject {
        public var hostname: String
        public var serverName: String
        public var localizedDescription: String

        @objc public init(hostname: String, serverName: String, localizedDescription: String) {
            self.hostname = hostname
            self.serverName = serverName
            self.localizedDescription = localizedDescription
        }
    }
}

@objc public extension TermiPassVpnManager {
    @objc enum LocalVpnSDKStatus: Int {
        case NoState = 0
        case InUseOtherUser = 1
        case NeedsLogin = 2 /// The VPN is not configured
        case NeedsMachineAuth = 3
        case Stopped = 4
        case Starting = 5
        case Running = 6
        
        public init(_ status: String) {
            switch status {
            case "NoState":
                self = .NoState
            case "InUseOtherUser":
                self = .InUseOtherUser
            case "NeedsLogin":
                self = .NeedsLogin
            case "NeedsMachineAuth":
                self = .NeedsMachineAuth
            case "Stopped":
                self = .Stopped
            case "Starting":
                self = .Starting
            case "Running":
                self = .Running
            default:
                self = .NoState
            }
        }
        
        func statusString() -> String {
            return TermiPassVpnManager.localVpnSDKToString(vpnStatus: self)
        }
    }
    
    @objc static func localVpnSDKToString(vpnStatus: LocalVpnSDKStatus) -> String {
        var status = ""
        
        switch vpnStatus {
        case .NoState:
            status = "NoState"
        case .InUseOtherUser:
            status = "InUseOtherUser"
        case .NeedsLogin:
            status = "NeedsLogin"
        case .NeedsMachineAuth:
            status = "NeedsMachineAuth"
        case .Stopped:
            status = "Stopped"
        case .Starting:
            status = "Starting"
        case .Running:
            status = "Running"
        }
        return status
    }
}

