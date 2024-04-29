//
//  TermiPassVPNUserDefaults.swift
//  TermiPassMac
//
//  Created by gjm on 9/6/23.
//

import Foundation

import Foundation
import os

@objc public extension UserDefaults {
    
    
#if os(iOS)
    @objc static let vpnAppGroupId: String = "group.terminus.planeta.vpn"
#elseif os(macOS)
    @objc static let vpnAppGroupId: String = "GBAD4ZL25F.group.com.terminus.planetamac.vpn"
#else
#error("Unimplemented")
#endif
    
    @objc static var vpnUserDefault: UserDefaults? {
        let appGroupId = UserDefaults.vpnAppGroupId
        
        print("appGroupId ===>")
        print(appGroupId)
        
        guard let userDefaults = UserDefaults(suiteName: appGroupId) else {
            os_log(.error, "Cannot obtain shared user defaults for tracking recently used tunnels")
            return nil
        }
        return userDefaults
    }
    
    @objc static func writeTemporaryData(key: String, value: Any) {
        vpnUserDefault?.set(value, forKey: key)
        vpnUserDefault?.synchronize()
    }
    
    @objc static func readTemporaryData(key: String) -> Any? {
        guard let obj = vpnUserDefault?.value(forKey: key) else { return nil }
        vpnUserDefault?.removeObject(forKey: key)
        vpnUserDefault?.synchronize()
        return obj
    }
    
    static func getAppExtensionContainerURL() -> String {
        guard let containerURL = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: UserDefaults.vpnAppGroupId) else {
            return ""
        }
        return containerURL.path
    }
    
    @objc static func getNodeInfo() -> String {

        let defaultNodeId = ""
        
        guard let current = UserDefaults.vpnUserDefault?.value(forKey: "statestore-_current-profile") else {
            return defaultNodeId
        }
        
        guard let currentStr = current as? String else { return defaultNodeId}
        
        if currentStr.count == 0 {
            return defaultNodeId
        }
        
        var decodedCurrentUserId = ""
        if let decodedData = Data(base64Encoded: currentStr) {
            decodedCurrentUserId = String(data: decodedData, encoding: .utf8)!
        }
        
        if !decodedCurrentUserId.starts(with: "profile-") {
            return defaultNodeId
        }
        
        let index = decodedCurrentUserId.index(decodedCurrentUserId.startIndex, offsetBy: "profile-".count)
        
        let currentUserId = decodedCurrentUserId[index ..< decodedCurrentUserId.endIndex]
        
        guard let currentInfo = UserDefaults.vpnUserDefault?.value(forKey: "statestore-_profiles") else {
            return defaultNodeId
        }
        guard let currentInfo = currentInfo as? String else {
            return defaultNodeId
        }
        
        let currentInfoData = try? UserDefaults.decodeUrlSafeBase64(currentInfo)
        
        guard let currentInfoData = currentInfoData else {
            return defaultNodeId
        }
        
        let currentInfoDataStr = try? JSONSerialization.jsonObject(with: currentInfoData,options: [.mutableContainers]);
        
        guard let currentInfoDataStr = currentInfoDataStr else {
            return defaultNodeId
        }
        
        guard let currentInfoDataDict = currentInfoDataStr as? [String: Any]   else {
            return defaultNodeId
        }
        
        
        let currentInfoModel = currentInfoDataDict["\(currentUserId)"]
        
        guard let currentInfoModel = currentInfoModel as? [String: Any]  else {
            return defaultNodeId
        }
        
        guard let nodeID = currentInfoModel["NodeID"]  else {
            return defaultNodeId
        }
        
        return "\(nodeID)"
    }
    
    static func decodeUrlSafeBase64(_ value: String) throws -> Data {
        var stringtoDecode: String = value.replacingOccurrences(of: "-", with: "+")
        stringtoDecode = stringtoDecode.replacingOccurrences(of: "_", with: "/")
        switch (stringtoDecode.utf8.count % 4) {
            case 2:
                stringtoDecode += "=="
            case 3:
                stringtoDecode += "="
            default:
                break
        }
        guard let data = Data(base64Encoded: stringtoDecode, options: [.ignoreUnknownCharacters]) else {
            throw NSError(domain: "decodeUrlSafeBase64", code: 1,
                        userInfo: [NSLocalizedDescriptionKey: "Can't decode base64 string"])
        }
        return data
    }
}
