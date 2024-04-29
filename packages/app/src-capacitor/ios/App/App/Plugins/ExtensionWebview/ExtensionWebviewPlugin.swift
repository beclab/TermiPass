//
//  ExtensionWebviewPlugin.swift
//  App
//
//  Created by gjm on 2023/4/14.
//

import Capacitor
import VaultBaseFramework
@objc(ExtensionWebviewPlugin)
public class ExtensionWebviewPlugin: CAPPlugin {
        
    @objc func open(_ call: CAPPluginCall) {
//        let url = call.getString("url") ?? ""
//        DispatchQueue.main.async {
//            let baseWebview = BaseWebviewController()
//            baseWebview.loadWebview(urlString: url) { status,message in
//            }
//            let vc = VBaseNavigationController(rootViewController: baseWebview)
////            vc.modalPresentationStyle = .fullScreen
//            self.bridge?.viewController?.present(vc, animated: false);
//        }        
        call.resolve()
    }
    
    func request(with url: URL) -> URLRequest {
        var request = URLRequest(url: url)

        guard let cookies = HTTPCookieStorage.shared.cookies(for: url) else {
            return request
        }
        
        print(cookies.description)

        request.allHTTPHeaderFields = HTTPCookie.requestHeaderFields(with: cookies)
        return request
    }
}

