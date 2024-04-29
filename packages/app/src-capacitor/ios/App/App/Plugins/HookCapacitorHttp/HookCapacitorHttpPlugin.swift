//
//  HookCapacitorHttpPlugin.swift
//  App
//
//  Created by gjm on 6/14/23.
//

import Capacitor
@objc(HookCapacitorHttpPlugin)
public class HookCapacitorHttpPlugin: CAPPlugin {
    @objc func http(_ call: CAPPluginCall, _ httpMethod: String?) {
        do {
            if let clazz = NSClassFromString("SSLPinningHttpRequestHandlerClass") {
                // swiftlint:disable force_cast
                (clazz as! NSObject.Type).perform(#selector(self.request(_:)), with: [
                    "call": call,
                    "httpMethod": httpMethod as Any,
                    "config": self.bridge?.config as Any
                ])
                // swiftlint:enable force_cast
            } else {
                try HookHttpRequestHandler.newRequest(call, httpMethod, self.bridge?.config)
            }
        } catch let error {
            call.reject(error.localizedDescription)
        }
    }
 
    @objc func request(_ call: CAPPluginCall) {
        http(call, nil)
    }

    @objc func get(_ call: CAPPluginCall) {
        http(call, "GET")
    }

    @objc func post(_ call: CAPPluginCall) {
        http(call, "POST")
    }

    @objc func put(_ call: CAPPluginCall) {
        http(call, "PUT")
    }

    @objc func patch(_ call: CAPPluginCall) {
        http(call, "PATCH")
    }

    @objc func delete(_ call: CAPPluginCall) {
        http(call, "DELETE")
    }
}
