//
//  PacketTunnelProvider.swift
//  TermiPassVPN
//
//  Created by gjm on 9/5/23.
//

import NetworkExtension

class PacketTunnelProvider: NEPacketTunnelProvider {
    
    private lazy var sdkManager: LocalVpnSDKManager = {
        return LocalVpnSDKManager(with: self)
    }()
    private lazy var mockTunnelConfiguration: TunnelConfiguration = {
        
        var interfaceConfig = InterfaceConfiguration()
        var adds = [IPAddressRange]()
        
        interfaceConfig.addresses = adds
        interfaceConfig.mtu = 1280
        
        var peerConfig = PeerConfiguration()
        
        var allowedIPs = [IPAddressRange]()
        
        peerConfig.allowedIPs = allowedIPs
    
        let config = TunnelConfiguration(name: "", interface: interfaceConfig, peers: [peerConfig])
        
        return config
    }()
    
    
    override func startTunnel(options: [String : NSObject]?, completionHandler: @escaping (Error?) -> Void) {
        sdkManager.start(tunnelConfiguration: self.mockTunnelConfiguration) { managerError in
            guard let managerError = managerError else {
                completionHandler(nil)
                return
            }
            completionHandler(managerError)
        }
    }
    
    override func stopTunnel(with reason: NEProviderStopReason, completionHandler: @escaping () -> Void) {
        // Add code here to start the process of stopping the tunnel.
        completionHandler()
    }
    
    override func handleAppMessage(_ messageData: Data, completionHandler: ((Data?) -> Void)?) {
        // Add code here to handle the message.
        if let handler = completionHandler {
            handler(messageData)
        }
    }
    
    override func sleep(completionHandler: @escaping () -> Void) {
        // Add code here to get ready to sleep.
        completionHandler()
    }
    
    override func wake() {
        // Add code here to wake up.
    }
}
