//
//  TermiPassVPNTemporaryKey.swift
//  TermiPassMac
//
//  Created by gjm on 9/6/23.
//

import Foundation

@objc public class VPNTemporaryKey: NSObject {
    // main to extension
    @objc static public var temporaryKey_update_vpn_status = "update_vpn_status";
    
    @objc static public var temporaryKey_open_url = "open_url"
    
    @objc static public var temporaryKey_server_url = "server_url"
    
    @objc static public var temporaryKey_server_authkey = "server_authkey"
    
    @objc static public var temporaryKey_cookies = "cookies"
    
    
    @objc static public var temporaryKey_sdk_status = "sdk_status"
    
    /// other node info
    @objc static public var temporaryKey_sdk_nodes_status = "sdk_nodes_status"
}
