//
//  PTVpnManager.swift
//  VpnTunnel
//
//  Created by gjm on 7/20/23.
//

import Foundation
import NetworkExtension

@objc public extension TermiPassVpnManager {
    static let didChangeStatusNotification = "TermiPassVpnManager.didChangeStatusNotification"

    static let didReceiveOpenUrlNotification = "TermiPassVpnManager.didReceiveOpenUrlNotification"
    
    static let didUpdateLocalVpnSDKStatusNotification = "TermiPassVpnManager.didUpdateLocalVpnSDKStatusNotification"
    static let didInitLocalVpnSDKStatusNotification = "TermiPassVpnManager.didInitLocalVpnSDKStatusNotification"
    
    static let closeLocalVpnSDKStatusNotification = "TermiPassVpnManager.didCloseLocalVpnSDKStatusNotification"
    static let openLocalVpnSDKStatusNotification = "TermiPassVpnManager.openLocalVpnSDKStatusNotification"
    static let getPeersStateSDKStatusNotification = "TermiPassVpnManager.getPeersStateSDKStatusNotification"
}

@objc public class TermiPassVpnManager: NSObject {
    
    public typealias Handler = (NSError?) -> Void
    
    @objc public static let shared = TermiPassVpnManager()
    
    public private(set) var tunnel: NETunnelProviderManager?
    
    @objc public var statusDidChangeHandler: ((Status) -> Void)?
    
    private var observers = [AnyObject]()
    
    public var isOn: Bool { status == .on }
    
    @objc public var connectNodeInfo = ""
    
    @objc public private(set) var status: Status = .off {
        didSet { notifyStatusDidChange() }
    }
    
    @objc public var localVpnSdkStatus:LocalVpnSDKStatus = .NoState {
        didSet {
            notifyStatusDidChange()
        }
    }

    
    public override init() {
        super.init()
        
        observers.append(
            NotificationCenter.default.addObserver(
                forName: .NEVPNStatusDidChange,
                object: nil,
                queue: OperationQueue.main
            ) { [weak self] _ in
                self?.updateStatus()
            }
        )
        
        observers.append(
            NotificationCenter.default.addObserver(
                forName: .NEVPNConfigurationChange,
                object: nil,
                queue: OperationQueue.main
            ) { [weak self] _ in
                self?.refresh()
            }
        )
                
        refresh()
    }
}

@objc public extension TermiPassVpnManager {

    func isVpnPrepared(completion: @escaping (Bool) -> Void) {
        loadTunnelManager { manager, error in
            if error != nil {
                return completion(false)
            }
            return completion(manager != nil)
        }
    }
    
    func start(with config: Config,
               completion: @escaping Handler) {
        self.localVpnSdkStatus = .NeedsLogin;
        loadTunnelManager { [unowned self] manager, error in
            if let error = error {
                return completion(error as NSError)
            }

            if manager == nil {
                self.tunnel = self.makeTunnelManager(with: config)
            } else {
                manager?.isEnabled = true
                manager?.isOnDemandEnabled = true
            }

            self.saveToPreferences(with: config) { [weak self] error in
                if let error = error {
                    return completion(error)
                }

                self?.tunnel?.loadFromPreferences() { [weak self] _ in
                    self?.start(completion)
                }
            }
        }
    }
    
    @objc func start(_ completion: @escaping Handler) {
        do {
            try tunnel?.connection.startVPNTunnel()
        } catch {
            completion(error as NSError)
        }
    }
    
    func stop() {
        tunnel?.connection.stopVPNTunnel()
    }
    
    func loadTunnelManager(_ complition: @escaping (NETunnelProviderManager?, NSError?) -> Void) {
        NETunnelProviderManager.loadAllFromPreferences { [unowned self] managers, error in
            self.tunnel = managers?.first
            complition(managers?.first, error as NSError?)
        }
    }
    
    func makeTunnelManager(with config: Config) -> NETunnelProviderManager {
        let manager = NETunnelProviderManager()
        let proto = NETunnelProviderProtocol()
        proto.serverAddress = config.serverName
        manager.protocolConfiguration = proto
        manager.localizedDescription = config.localizedDescription
        manager.isEnabled = true
        manager.isOnDemandEnabled = true
        return manager
    }

    @objc func saveToPreferences(with config: Config? = nil,
                           completion: @escaping Handler) {
        if let config = config {
            tunnel?.config(with: config)
        }
        tunnel?.saveToPreferences { error in
            completion(error as NSError?)
        }
    }
    
    
    func notifyStatusDidChange() {
        NotificationCenter.default.post(
            name: Notification.Name(rawValue: TermiPassVpnManager.didChangeStatusNotification),
            object: nil
        )
        statusDidChangeHandler?(status)
    }
    
    
    func updateStatus() {
        if let tunnel = tunnel {
            status = Status(tunnel.connection.status)
        } else {
            status = .off
        }

        print(status)
    }

    func refresh(completion: Handler? = nil) {
        loadTunnelManager { [weak self] _, error in
            self?.updateStatus()
            completion?(error)
        }
    }
}

let vpn_config_hostName = "127.0.0.1";
let vpn_config_serverName = "TermiPass";
let vpn_config_localizedDescription = "TermiPass VPN";


@objc public extension TermiPassVpnManager {
    @objc func openVpn(_ serverUrl: String, _ authKey: String, _ cookies: String) {

        UserDefaults.writeTemporaryData(key: VPNTemporaryKey.temporaryKey_server_url, value: serverUrl);
        UserDefaults.writeTemporaryData(key: VPNTemporaryKey.temporaryKey_server_authkey, value: authKey);
        UserDefaults.writeTemporaryData(key: VPNTemporaryKey.temporaryKey_cookies, value: cookies);
                        
        let config = Config(hostname: vpn_config_hostName, serverName: vpn_config_serverName, localizedDescription: vpn_config_localizedDescription)

        start(with: config) { error in
            if let error = error {
                print(error.description);
            }
        }
    }
}


public extension NETunnelProviderManager {
    func config(with config: TermiPassVpnManager.Config) {
        guard let proto = protocolConfiguration as? NETunnelProviderProtocol else {
            return
        }

        proto.serverAddress = config.serverName
        protocolConfiguration = proto
    }
}

