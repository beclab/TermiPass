//
//  ThemePlugin.swift
//  App
//
//  Created by gjm on 7/11/24.
//
//AUTO = 0,
//LIGHT = 1,
//DARK = 2
import Foundation
import Capacitor
import VaultBaseFramework

@objc(ThemePlugin)
public class ThemePlugin: CAPPlugin {

    @objc func set(_ call: CAPPluginCall) {
        let theme = call.getInt("theme", 2);
        ConfigStorage.setData(key: "theme", value: theme);
        call.resolve();
    }
    
    @objc func get(_ call: CAPPluginCall) {
        let theme = ConfigStorage.getData(key: "theme", defalt: 2);
        call.resolve([
            "theme": theme
        ])
    }
    
}
