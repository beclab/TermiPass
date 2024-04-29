//
//  EchoPlugin.swift
//  App
//
//  Created by gjm on 2022/12/30.
//

import Capacitor
@objc(EchoPlugin)
public class EchoPlugin: CAPPlugin {
    @objc func echo(_ call: CAPPluginCall) {
        let value = call.getString("value") ?? ""
        call.resolve(["value": value])
    }
}
