//
//  ProxyInfoPlugin.swift
//  App
//
//  Created by gjm on 8/10/23.
//

import Capacitor
import Alamofire
import VaultBaseFramework

@objc(ProxyInfoPlugin)
public class ProxyInfoPlugin: CAPPlugin {
 
    @objc func getServerInfo(_ call: CAPPluginCall) {
        let value = call.getString("value") ?? ""
        
        guard let serverUrl = bridge?.config.serverURL else {
            call.reject("bridge config serverUrl empty")
            return
        }
        
        let contents = URLComponents(url: serverUrl, resolvingAgainstBaseURL: true)
        
        let result = [
            "serverUrl": serverUrl.absoluteString,
            "scheme": serverUrl.scheme ?? "",
            "host": contents?.host ?? "",
            "port": "\(contents?.port ?? 0)"
        ] as [String : String]
        
        call.resolve(result)
    }
}
