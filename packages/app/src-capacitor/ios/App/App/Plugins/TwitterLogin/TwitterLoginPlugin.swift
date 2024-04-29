//
//  TwitterLoginPlugin.swift
//  App
//
//  Created by gjm on 2023/1/5.
//

import Capacitor
import VaultBaseFramework
@objc(TwitterLoginPlugin)
public class TwitterLoginPlugin: CAPPlugin {
    
//    private var call:CAPPluginCall?
    
    @objc func login(_ call: CAPPluginCall) {
        let oauthUrl = call.getString("oauthUrl") ?? ""
        DispatchQueue.main.async {
            let twitterLoginVC = TwitterOauthLoginController()
            twitterLoginVC.loadWebview(urlString: oauthUrl) { status,message in
                call.resolve([
                    "status": status,
                    "message": message
                ])
            }
            let vc = TermiPassBaseNavigationController(rootViewController: twitterLoginVC)
            vc.modalPresentationStyle = .fullScreen;
            self.bridge?.viewController?.present(vc, animated: true);
        }
        
    }
}

