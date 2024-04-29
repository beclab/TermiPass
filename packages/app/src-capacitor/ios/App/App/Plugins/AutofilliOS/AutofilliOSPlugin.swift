//
//  AutofilliOSPlugin.swift
//  App
//
//  Created by gjm on 2023/4/26.
//

import Capacitor
import VaultBaseFramework
import AuthenticationServices

@objc(AutofilliOSPlugin)
public class AutofilliOSPlugin: CAPPlugin {
    @objc func getAutofillList(_ call: CAPPluginCall) {
        let autolist = AutoFillStorage.getAllAutoFill()
        call.resolve(["list":autolist]);
    }
    
    @objc func clearAutofillList(_ call: CAPPluginCall) {
        AutoFillStorage.clearData()
    }
    
    @objc func replaceAllIdentities(_ call: CAPPluginCall) {
        let identities = call.getArray("identities") ?? []
        
        var savePasswordCredential :[ASPasswordCredentialIdentity] = []
        
        identities.forEach { value in
            if let value = value as? [String:String] {
                let url = value["url"]
                let userName = value["userName"]
                let id = value["id"]
                if let url = url, let userName = userName, let id = id {
                    savePasswordCredential.append(ToCredentialIdentity(url: url, userName: userName, id: id, domain: true))
                    savePasswordCredential.append(ToCredentialIdentity(url: url, userName: userName, id: id, domain: false))
                }
            }
        }
        
        let store = ASCredentialIdentityStore.shared
        
        store.getState { state in
            if state.isEnabled {
                store.replaceCredentialIdentities(with: savePasswordCredential) {success, error in
                    if success {
                        call.resolve()
                    } else {
                        call.reject(error?.localizedDescription ?? "save error 11")
                    }
                }
                
            } else {
                call.reject("save error")
            }
        }
    }
    
    func ToCredentialIdentity(url: String, userName: String, id: String, domain: Bool) -> ASPasswordCredentialIdentity {
        
        let serviceId = ASCredentialServiceIdentifier(identifier: url, type: domain ? .domain : .URL)
        
        return ASPasswordCredentialIdentity(serviceIdentifier: serviceId, user: userName, recordIdentifier: id)
    }
}
