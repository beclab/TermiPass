//
//  TwitterOauthLoginController.swift
//  App
//
//  Created by gjm on 2023/1/5.
//

import UIKit
import WebKit
import SnapKit
import VaultBaseFramework

class TwitterOauthLoginController: TermiPassBaseWebviewController {
    
    override public func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        print("webview.url")
        print(webview.url ?? "")
        if let path = webview.url?.path,(path.starts(with: "twitter_result") || path.starts(with: "/twitter_result") || path.starts(with: "/google_result") || path.starts(with: "google_result"))   {
            if let callBack = self.callBack {
//                callBack(webview.url)
                self.dismiss(animated: true)
                if  let urlParameters = webView.url?.urlParameters,let message = urlParameters["message"] {
                    callBack(true,message)
                } else {
                    callBack(false,"")
                }
            }
        }
    }
        
}

