//
//  TermipassRootController.swift
//  App
//
//  Created by gjm on 7/15/24.
//

import UIKit
import Capacitor

class TermipassRootController: CAPBridgeViewController {
    
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(TailScalePlugin())
        bridge?.registerPluginInstance(StorageiOSPlugin())
        bridge?.registerPluginInstance(StorageUseriOSPlugin())
        bridge?.registerPluginInstance(AppSettingsPlugin())
        bridge?.registerPluginInstance(GoogleAuthPlugin())
        bridge?.registerPluginInstance(DropboxAuthPlugin())
        bridge?.registerPluginInstance(HookCapacitorHttpPlugin())
        bridge?.registerPluginInstance(AutofilliOSPlugin())
        bridge?.registerPluginInstance(TwitterLoginPlugin())
    }
}
