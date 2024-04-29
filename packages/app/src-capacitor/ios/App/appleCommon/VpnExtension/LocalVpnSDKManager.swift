//
//  TailscalSdkEnter.swift
//  VpnTunnel
//
//  Created by gjm on 7/20/23.
//

import Foundation
import LocalVpnSDK
import os
import NetworkExtension

public enum LocalVpnSDKManagerError: Error {
    /// Failure to locate tunnel file descriptor.
    case cannotLocateTunnelFileDescriptor

    /// Failure to perform an operation in such state.
    case invalidState

    /// Failure to set network settings.
    case setNetworkSettings(Error)
}

private enum State {
    /// The tunnel is stopped
    case stopped

    /// The tunnel is up and running
    case started(_ settingsGenerator: PacketTunnelSettingsGenerator)

    /// The tunnel is temporarily shutdown due to device going offline
    case temporaryShutdown(_ settingsGenerator: PacketTunnelSettingsGenerator)
}


class LocalVpnSDKManager: NSObject {

    private weak var packetTunnelProvider: NEPacketTunnelProvider?

    /// Private queue used to synchronize access to `WireGuardAdapter` members.
    private let workQueue = DispatchQueue(label: "TailscalSdkManagerWorkQueue")

    /// Adapter state.
    private var state: State = .stopped
    
    private var getStatusCount = 0

    public init(with packetTunnelProvider: NEPacketTunnelProvider) {
        super.init()
        self.packetTunnelProvider = packetTunnelProvider
        initNotifications()
//        tp_log(.default, message: "xcode / call init ----")
        self.openSdk()
    }

    func initNotifications() {
        NotificationCenter.default.addObserver(self, selector: #selector(openUrlNofitication), name: NSNotification.Name("OpenUrlNotification"), object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(printLog), name: NSNotification.Name("IOSLogNotification"), object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(updateUtunNotification), name: Notification.Name("updateUtunNotification"), object: nil)

        TermiPassDarwinNotificationManager.sharedInstance().registerNotification(forName: TermiPassVpnManager.didInitLocalVpnSDKStatusNotification) {
            let jsonString = Local_vpn_sdkStatus()
            self.resolveCallSDKBackStatus(jsonStr: jsonString)
        }

        TermiPassDarwinNotificationManager.sharedInstance().registerNotification(forName: TermiPassVpnManager.closeLocalVpnSDKStatusNotification) {
            Local_vpn_sdkLogout()
        }

        TermiPassDarwinNotificationManager.sharedInstance().registerNotification(forName: TermiPassVpnManager.openLocalVpnSDKStatusNotification) {
            Local_vpn_sdkLogin()
        }
        TermiPassDarwinNotificationManager.sharedInstance().registerNotification(forName: TermiPassVpnManager.getPeersStateSDKStatusNotification) {
            let nodeStatus = Local_vpn_sdkState()
            tp_log(.default, message: "node status====>:\n\(nodeStatus)\n <====node status")
            UserDefaults.writeTemporaryData(key: VPNTemporaryKey.temporaryKey_sdk_nodes_status, value: nodeStatus)
        }
    }

    @objc func updateUtunNotification(_ not: Notification) {

        guard let object = not.object else { return }

        if let dict = object as? [String: String] {
            guard let address = dict["addresses"] else {
                return
            }
            guard let route = dict["routers"] else {
                return
            }
            let addresses = address.components(separatedBy: ",")
            let routes = route.components(separatedBy: ",")
            let config = createConfigs(addresses: addresses, routes: routes)
            self.update(tunnelConfiguration: config) { error in
                tp_log(.default, message: "updateUtunNotification update error \(String(describing: error?.localizedDescription))")
            }
        }
    }

    /// Update runtime configuration.
    /// - Parameters:
    ///   - tunnelConfiguration: tunnel configuration.
    ///   - completionHandler: completion handler.
    public func update(tunnelConfiguration: TunnelConfiguration, completionHandler: @escaping (LocalVpnSDKManagerError?) -> Void) {
        workQueue.async {
            if case .stopped = self.state {
                completionHandler(.invalidState)
                return
            }


            self.packetTunnelProvider?.reasserting = true
            defer {
                self.packetTunnelProvider?.reasserting = false
            }

            do {
                let settingsGenerator = try self.makeSettingsGenerator(with: tunnelConfiguration)
                try self.setNetworkSettings(settingsGenerator.generateNetworkSettings())

                switch self.state {
                case .started(_):
                    self.state = .started(settingsGenerator)

                case .temporaryShutdown:
                    self.state = .temporaryShutdown(settingsGenerator)

                case .stopped:
                    fatalError()
                }

                completionHandler(nil)
            } catch let error as LocalVpnSDKManagerError {
                completionHandler(error)
            } catch {
                fatalError()
            }
        }
    }


    @objc func openUrlNofitication(notification: Notification) {
        tp_log(.default, message:  "receive sdk set openurl notification, options: \(String(describing: notification.object))")

        UserDefaults.writeTemporaryData(key: VPNTemporaryKey.temporaryKey_open_url, value: notification.object ?? "")

//        TermiPassDarwinNotificationManager.sharedInstance().postNotification(forName: TermiPassVpnManager.didReceiveOpenUrlNotification)
    }
    @objc func printLog(notification: Notification) {
        tp_log(.default, message: notification.object as! String)
    }

    /// Tunnel device file descriptor.
    private var tunnelFileDescriptor: Int32? {
        var ctlInfo = ctl_info()
        withUnsafeMutablePointer(to: &ctlInfo.ctl_name) {
            $0.withMemoryRebound(to: CChar.self, capacity: MemoryLayout.size(ofValue: $0.pointee)) {
                _ = strcpy($0, "com.apple.net.utun_control")
            }
        }
        for fd: Int32 in 0...1024 {
            var addr = sockaddr_ctl()
            var ret: Int32 = -1
            var len = socklen_t(MemoryLayout.size(ofValue: addr))
            withUnsafeMutablePointer(to: &addr) {
                $0.withMemoryRebound(to: sockaddr.self, capacity: 1) {
                    ret = getpeername(fd, $0, &len)
                }
            }
            if ret != 0 || addr.sc_family != AF_SYSTEM {
                continue
            }
            if ctlInfo.ctl_id == 0 {
                ret = ioctl(fd, CTLIOCGINFO, &ctlInfo)
                if ret != 0 {
                    continue
                }
            }
            if addr.sc_id == ctlInfo.ctl_id {
                return fd
            }
        }
        return nil
    }

    public var interfaceName: String? {
        guard let tunnelFileDescriptor = self.tunnelFileDescriptor else { return nil }

        var buffer = [UInt8](repeating: 0, count: Int(IFNAMSIZ))

        return buffer.withUnsafeMutableBufferPointer { mutableBufferPointer in
            guard let baseAddress = mutableBufferPointer.baseAddress else { return nil }

            var ifnameSize = socklen_t(IFNAMSIZ)
            let result = getsockopt(
                tunnelFileDescriptor,
                2 /* SYSPROTO_CONTROL */,
                2 /* UTUN_OPT_IFNAME */,
                baseAddress,
                &ifnameSize)

            if result == 0 {
                return String(cString: baseAddress)
            } else {
                return nil
            }
        }
    }

    public func start(tunnelConfiguration: TunnelConfiguration, completionHandler: @escaping (LocalVpnSDKManagerError?) -> Void) {
        workQueue.async {
            guard case .stopped = self.state else {
                completionHandler(.invalidState)
                return
            }

            do {
                let settingsGenerator = try self.makeSettingsGenerator(with: tunnelConfiguration)
                try self.setNetworkSettings(settingsGenerator.generateNetworkSettings())

                self.state = .started(
                    settingsGenerator
                )
                completionHandler(nil)
            } catch let error as LocalVpnSDKManagerError {
                completionHandler(error)
            } catch {
                fatalError()
            }
        }
    }

    public func openSdk() {

        guard let fd = self.tunnelFileDescriptor else {
            tp_log(.error, message: "Termipass get fd error")
            return
        }

        guard let serverAddress = UserDefaults.readTemporaryData(key: VPNTemporaryKey.temporaryKey_server_url) else {
            tp_log(.error, message: "Termipass get server address is empty")
            return
        }

        guard let serverAuthkey = UserDefaults.readTemporaryData(key: VPNTemporaryKey.temporaryKey_server_authkey) else {
            tp_log(.error, message: "Termipass get server Authkey is empty")
            return
        }
        
        guard let cookies = UserDefaults.readTemporaryData(key: VPNTemporaryKey.temporaryKey_cookies) else {
            tp_log(.error, message: "Termipass get server cookies is empty")
            return
        }

        guard let serverAddress =  serverAddress as? String else { return }

        guard let serverAuthkey = serverAuthkey as? String else { return }
        
        guard let cookies = cookies as? String else { return }
        tp_log(.default, message: "serverAddress=\(serverAddress)")
        tp_log(.default, message: "serverAuthkey=\(serverAuthkey)")
        tp_log(.default, message: "cookies=\(cookies)")
        
        
        Local_vpn_sdkSDKInitFunc(Int(fd), serverAddress, serverAuthkey, "", cookies, self)
        Local_vpn_sdkLogin()
    }


    /// Resolves the hostnames in the given tunnel configuration and return settings generator.
    /// - Parameter tunnelConfiguration: an instance of type `TunnelConfiguration`.
    /// - Throws: an error of type `WireGuardAdapterError`.
    /// - Returns: an instance of type `PacketTunnelSettingsGenerator`.
    private func makeSettingsGenerator(with tunnelConfiguration: TunnelConfiguration) throws -> PacketTunnelSettingsGenerator {
        return PacketTunnelSettingsGenerator(
            tunnelConfiguration: tunnelConfiguration,
            tunnelProvider: self.packetTunnelProvider
        )
    }


    /// Set network tunnel configuration.
    /// This method ensures that the call to `setTunnelNetworkSettings` does not time out, as in
    /// certain scenarios the completion handler given to it may not be invoked by the system.
    ///
    /// - Parameters:
    ///   - networkSettings: an instance of type `NEPacketTunnelNetworkSettings`.
    /// - Throws: an error of type `WireGuardAdapterError`.
    /// - Returns: `PacketTunnelSettingsGenerator`.
    private func setNetworkSettings(_ networkSettings: NEPacketTunnelNetworkSettings) throws {
        var systemError: Error?
        let condition = NSCondition()

        // Activate the condition
        condition.lock()
        defer { condition.unlock() }

        self.packetTunnelProvider?.setTunnelNetworkSettings(networkSettings) { error in
            systemError = error
            condition.signal()
        }

        // Packet tunnel's `setTunnelNetworkSettings` times out in certain
        // scenarios & never calls the given callback.
        let setTunnelNetworkSettingsTimeout: TimeInterval = 5 // seconds

        if condition.wait(until: Date().addingTimeInterval(setTunnelNetworkSettingsTimeout)) {
            if let systemError = systemError {
                throw LocalVpnSDKManagerError.setNetworkSettings(systemError)
            }
        } else {

        }
    }


    func createConfigs(addresses: [String], routes: [String]) -> TunnelConfiguration {

        var interfaceConfig = InterfaceConfiguration()
        var adds = [IPAddressRange]()
        for addressString in addresses {
            guard let address = IPAddressRange(from: addressString) else {
                continue
            }
            adds.append(address)
        }
        interfaceConfig.addresses = adds
#if os(iOS)
        interfaceConfig.mtu = 1280
#elseif os(macOS)
        interfaceConfig.mtu = 1280
#else
#error("Unimplemented")
#endif
        let peerConfig = PeerConfiguration()

        var allowedIPs = [IPAddressRange]()
        for addressString in routes {
            guard let address = IPAddressRange(from: addressString) else {
                continue
            }
            allowedIPs.append(address)
        }

        peerConfig.allowedIPs = allowedIPs


        let config = TunnelConfiguration(name: "", interface: interfaceConfig, peers: [peerConfig])

        return config
    }
}


extension LocalVpnSDKManager : UtilsCallbackProtocol {

    /// code == 0 做登录操作
    /// 状态码
    /**
       NoState          State = 0
       InUseOtherUser   State = 1
       NeedsLogin       State = 2
       NeedsMachineAuth State = 3
       Stopped          State = 4
       Starting         State = 5
       Running          State = 6
     */

    func `do`(_ s: String?) {
        tp_log(.default, message: s ?? "")

        resolveCallSDKBackStatus(jsonStr: s)
    }

    func getFd() -> Int {
        return 1
    }

    func getInterfacesAsString() -> String {
        return ""
    }

    func init_(_ s: String?) {
        tp_log(.default, message: s ?? "")

        let result = getLocalVpnSDKStatus(jsonStr: s)

        if result.0 == 0 && result.1 == .NeedsLogin {
            Local_vpn_sdkLogin()
        }
    }


    func log(_ s: String?) {
        tp_log(.default, message: s ?? "")
    }

    func read(_ key: String?) -> String {
        guard let vpnUserDefault = UserDefaults.vpnUserDefault, let key = key else { return "" }
        return vpnUserDefault.string(forKey: key) ?? ""
    }

    func write(_ key: String?, value: String?) {
        guard let vpnUserDefault = UserDefaults.vpnUserDefault, let key = key, let value = value else {
            return
        }
        tp_log(.default, message: "key: \(key):\nvalue:\(value)")
        vpnUserDefault.set(value, forKey: key)
    }

    func setAndroidProtect(_ fd: Int) {

    }

    func setRouter(_ addr: String?, routers: String?) {
        tp_log(.default, message: addr ?? "")
        tp_log(.default, message: routers ?? "")


        var addresses:[String] = []
        var routes:[String] = []

        if let address = addr {
            addresses = address.components(separatedBy: ",")
        }

        if let routers = routers {
            routes = routers.components(separatedBy: ",")
        }

        let config = createConfigs(addresses: addresses, routes: routes)
        self.update(tunnelConfiguration: config) { error in
            tp_log(.default, message: "updateUtunNotification update error \(String(describing: error?.localizedDescription))")
        }
    }

    func updateTun(_ dnsServer: String?, searchDomain: String?, routes: String?, addrs: String?) -> Int {
        return 1
    }

}

extension LocalVpnSDKManager {

    func getLocalVpnSDKStatus(jsonStr: String?) -> (Int, TermiPassVpnManager.LocalVpnSDKStatus) {

        guard let callBackJsonStr = jsonStr else {
            return (-1, TermiPassVpnManager.LocalVpnSDKStatus.NoState)
        }

        let jsonData = callBackJsonStr.data(using: String.Encoding.utf8, allowLossyConversion: false) ?? Data()

        guard let json = try? JSONSerialization.jsonObject(with: jsonData, options: .mutableContainers) else{
             return (-1, TermiPassVpnManager.LocalVpnSDKStatus.NoState)
        }

        guard let jsonM = json as? [String: Any] else {
            return (-1, TermiPassVpnManager.LocalVpnSDKStatus.NoState)
        }

        guard let sdkCode = jsonM["code"], let sdkStatus = jsonM["status"] else {
            return (-1, TermiPassVpnManager.LocalVpnSDKStatus.NoState)
        }

        guard let code = Int("\(sdkCode)") else {
            return (-1, TermiPassVpnManager.LocalVpnSDKStatus.NoState)
        }

        let sdkStatusString = "\(sdkStatus)"
        let sdkStatusFormat = TermiPassVpnManager.LocalVpnSDKStatus.init(sdkStatusString)

       return (code, sdkStatusFormat)
    }

    func resolveCallSDKBackStatus(jsonStr: String?) {
        let result = getLocalVpnSDKStatus(jsonStr: jsonStr)

        if result.0 < 0 {
            return
        }
        
        if result.1 == TermiPassVpnManager.LocalVpnSDKStatus.Starting {
            if self.getStatusCount < 15 {
                self.getStatusCount += 1;
                workQueue.asyncAfter(deadline: .now() + 1) {[weak self] in
                    self?.getVpnStatus()
                }
                return
            }
        }
        self.getStatusCount = 0;
        
        if (result.1 == .Running) {
            let nodeStatus = Local_vpn_sdkState()
            tp_log(.default, message: "node status====>:\n\(nodeStatus)\n <====node status")
            UserDefaults.writeTemporaryData(key: VPNTemporaryKey.temporaryKey_sdk_nodes_status, value: nodeStatus)
        } else {
            UserDefaults.writeTemporaryData(key: VPNTemporaryKey.temporaryKey_sdk_nodes_status, value: "")
        }

        UserDefaults.writeTemporaryData(key: VPNTemporaryKey.temporaryKey_sdk_status, value: result.1.rawValue)
        TermiPassDarwinNotificationManager.sharedInstance().postNotification(forName: TermiPassVpnManager.didUpdateLocalVpnSDKStatusNotification)
    }
    
    func getVpnStatus() {
        let jsonString = Local_vpn_sdkStatus()
        self.resolveCallSDKBackStatus(jsonStr: jsonString)
    }
}
