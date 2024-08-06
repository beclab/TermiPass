//
//  DropboxPlugin.swift
//  App
//
//  Created by gjm on 6/18/24.
//

import Foundation
import Capacitor
import SwiftyDropbox


@objc(DropboxAuthPlugin)
public class DropboxAuthPlugin: CAPPlugin, CAPBridgedPlugin {
    
    public let identifier = "DropboxAuthPlugin"
    
    public let jsName = "DropboxAuthPlugin"
    
    public var pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "signIn", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "initialize", returnType: CAPPluginReturnPromise)
    ]
    
    var signInCall: CAPPluginCall!
    
    public override func load() {
        DropboxClientsManager.setupWithTeamAppKey("oi7kyle19hkh6q6")
        DropboxOauthManager.standManager.authResultCallBack = {
            if let authResult = $0 {
                switch authResult {
                case .success(let token):
                    self.signInCall.resolve([
                        "accessToken": token.accessToken,
                        "uid": token.uid,
                        "refreshToken": token.refreshToken ?? "",
                        "tokenExpirationTimestamp": token.tokenExpirationTimestamp ?? 0
                    ])
                case .cancel:
                    self.signInCall.reject("Authorization flow was manually canceled by user!")
                case .error(_, let description):
                    self.signInCall.reject("\(String(describing: description))")
                }
            }
        }
    }
    @objc
    func initialize(_ call: CAPPluginCall) {
        call.resolve();
    }
    
    @objc
    func signIn(_ call: CAPPluginCall) {
        self.signInCall = call;
        DispatchQueue.main.async {
            let scopeRequest = ScopeRequest(scopeType: .user, scopes: [], includeGrantedScopes: false)
            DropboxClientsManager.authorizeFromControllerV2(
                UIApplication.shared,
                controller: self.bridge?.viewController,
                loadingStatusDelegate: nil,
                openURL: { (url: URL) -> Void in UIApplication.shared.open(url, options: [:], completionHandler: nil) },
                scopeRequest: scopeRequest
            )
        }
    }
    
    private func handle(url: URL) {
        let oauthCompletion: DropboxOAuthCompletion = {
            if let authResult = $0 {
                switch authResult {
                case .success:
                    print("Success! User is logged into DropboxClientsManager.")
                case .cancel:
                    print("Authorization flow was manually canceled by user!")
                case .error(_, let description):
                    print("Error: \(String(describing: description))")
                }
            }
        }
        DropboxClientsManager.handleRedirectURL(url, includeBackgroundClient: false, completion: oauthCompletion)
    }
}
