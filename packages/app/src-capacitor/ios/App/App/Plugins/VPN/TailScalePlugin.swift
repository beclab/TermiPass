//
//  TailScalePlugin.swift
//  App
//
//  Created by gjm on 9/5/23.
//

import Capacitor
import Alamofire
import HandyJSON

@objc(TailScalePlugin)
public class TailScalePlugin: CAPPlugin, CAPBridgedPlugin {
    
    public let identifier = "TailScalePlugin"
    public let jsName = "TailScalePlugin"
    
    public var pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "open", returnType: CAPPluginReturnNone),
        CAPPluginMethod(name: "close", returnType: CAPPluginReturnNone),
        CAPPluginMethod(name: "status", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "currentNodeId", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "peersState", returnType: CAPPluginReturnPromise)
        
    ]
    
    @objc func open(_ call: CAPPluginCall) {
        let authKey = call.getString("authKey") ?? ""
        let server = call.getString("server") ?? ""
        
        var cookies = "" //CapacitorCookieManager(self.bridge?.config).getCookies()
        
        if let url = URL(string: server) {
            if let cookiesList = HTTPCookieStorage.shared.cookies(for: url) {
                cookies = cookiesList.map({"\($0.name)=\($0.value)"}).joined(separator: "; ")
            }
        }
        
        if (TermiPassVpnManager.shared.status == .off) {
            TermiPassVpnManager.shared.openVpn(server, authKey, cookies)
        } else {
            TermiPassDarwinNotificationManager.sharedInstance().postNotification(forName: TermiPassVpnManager.openLocalVpnSDKStatusNotification)
        }
    }
    
    @objc func close(_ call: CAPPluginCall) {
        if !TermiPassVpnManager.shared.isOn {
            return
        }
        TermiPassVpnManager.shared.stop()
    }
    
    @objc func status(_ call: CAPPluginCall) {
        
        let result = [
            "status": TermiPassVpnManager.shared.localVpnSdkStatus.statusString(),
            "options":[
                "extensionVpnStatus": TermiPassVpnManager.shared.status.rawValue
            ]
        ] as [String : Any]
        call.resolve(result)
    }
    

    @objc func currentNodeId(_ call: CAPPluginCall) {
        call.resolve(
            [
                "nodeId": UserDefaults.getNodeInfo()
            ]
        )
    }
    
    @objc func peersState(_ call: CAPPluginCall) {
        if TermiPassVpnManager.shared.localVpnSdkStatus != .Running {
            call.resolve([
                "isRunning": false,
                "state": ""
            ])
            return
        }
        

        
        TermiPassDarwinNotificationManager.sharedInstance().postNotification(forName: TermiPassVpnManager.getPeersStateSDKStatusNotification)

        
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
            if let connectNodeInfo = UserDefaults.readTemporaryData(key: VPNTemporaryKey.temporaryKey_sdk_nodes_status) {
                if let jsonM = connectNodeInfo as? String {
                    print("jsonM ===>\(jsonM)")
                    TermiPassVpnManager.shared.connectNodeInfo = jsonM
                }
            }
            call.resolve([
                "isRunning": true,
                "state": TermiPassVpnManager.shared.connectNodeInfo
            ])
        }
    }
    
    
    public override func load() {
        super.load()
        
        TermiPassVpnManager.shared.statusDidChangeHandler = { status in
            self.notifyListeners("vpnStatusUpdate", data: [
                "status": TermiPassVpnManager.shared.localVpnSdkStatus.statusString(),
                "options":[
                    "extensionVpnStatus": TermiPassVpnManager.shared.status.rawValue
                ]
            ], retainUntilConsumed: true)
        }
        
        TermiPassDarwinNotificationManager.sharedInstance().registerNotification(forName: TermiPassVpnManager.didUpdateLocalVpnSDKStatusNotification) {
            
            guard let status = UserDefaults.readTemporaryData(key: VPNTemporaryKey.temporaryKey_sdk_status) else {
                return
            }
            
            guard let statusValue = Int("\(status)") else {
                return
            }
            
            TermiPassVpnManager.shared.connectNodeInfo = ""
            if let connectNodeInfo = UserDefaults.readTemporaryData(key: VPNTemporaryKey.temporaryKey_sdk_nodes_status) {
                if let jsonM = connectNodeInfo as? String {
                    TermiPassVpnManager.shared.connectNodeInfo = jsonM
                }
            }

            TermiPassVpnManager.shared.localVpnSdkStatus = TermiPassVpnManager.LocalVpnSDKStatus(rawValue: statusValue) ?? .NoState
        }
        
        TermiPassDarwinNotificationManager.sharedInstance().postNotification(forName: TermiPassVpnManager.didInitLocalVpnSDKStatusNotification)
    }
}

open class TailscaleProfile : HandyJSON{
    
    var ID = ""
    
    var Name = ""
    
    var Key = ""
    
    var NodeID = ""
    
    var LocalUserID = ""
    
    var ControlURL = ""
    
    required public init() {}
}
