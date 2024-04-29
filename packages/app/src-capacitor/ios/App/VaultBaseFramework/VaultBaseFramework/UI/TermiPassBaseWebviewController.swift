//
//  BaseWebviewController.swift
//  App
//
//  Created by gjm on 2023/4/14.
//

import UIKit

import WebKit
import SnapKit

open class TermiPassBaseWebviewController: UIViewController {
        
    public var callBack: ((_ status: Bool, _ message: String) -> Void)?
    
    var loadUrl: String = ""
    
    var hasCallBack = false

    public override func viewDidLoad() {
        super.viewDidLoad()
        view.addSubview(self.webview)
        view.addSubview(self.myProgressView);
//        self.modalPresentationStyle = .fullScreen;
        
        self.webview.snp.makeConstraints { make in
            make.edges.equalTo(self.view)
        }

        let url = URL(string: self.loadUrl)
        if let url = url {
            self.webview.load(URLRequest(url: url))
        }

        view.backgroundColor = UIColor(red: 13.0/255, green: 13.0/255, blue: 13.0/255, alpha: 1);

        let leftButton = UIBarButtonItem(image: UIImage(named: "base_black_left_arrow"), style: .plain, target: self, action: #selector(backButton))
//        leftButton.tintColor = UIColor.white;

        self.navigationItem.leftBarButtonItem = leftButton
//        self.navigationItem.titleView?.tintColor = UIColor.red
        
        // Do any additional setup after loading the view.
    }
    
    @objc public func backButton() {
        hasCallBack = true
        if let callBack = self.callBack {
            callBack(false,"Cancel oauth");
            self.dismiss(animated: true)
        }
    }
    
    public override func viewDidDisappear(_ animated: Bool) {
        super.viewDidDisappear(animated);
        if (!self.hasCallBack) {
            if let callBack = self.callBack {
                callBack(false,"Cancel oauth");
            }
        }
    }
    
    public func loadWebview(urlString: String, callBack:@escaping (_ status: Bool, _ message: String) -> Void) {
        self.loadUrl = urlString
        self.callBack = callBack

    }
    
    public override func observeValue(forKeyPath keyPath: String?, of object: Any?, change: [NSKeyValueChangeKey : Any]?, context: UnsafeMutableRawPointer?) {
        if keyPath == "estimatedProgress" && object as! NSObject == self.webview {
            let newprogress = change?[NSKeyValueChangeKey.newKey] as? Double
            if let newprogress = newprogress {
                self.myProgressView.alpha = 1
                self.myProgressView.setProgress(Float(newprogress), animated: true)
                if newprogress >= 1 {
                    UIView.animate(withDuration: 0.3, delay: 0.3, animations: {
                        self.myProgressView.alpha = 0;
                    }) { _ in
                        self.myProgressView.setProgress(0, animated: false)
                    }
                }
            }
        }
        
        if keyPath == "title" && object as! NSObject == self.webview {
            self.title = self.webview.title
        }
    }
    
    public lazy var webview: WKWebView = {
        let configuration = WKWebViewConfiguration()
        configuration.selectionGranularity = .character
        let userContentController = WKUserContentController()
        configuration.userContentController = userContentController
        let preferences = WKPreferences()
        preferences.javaScriptCanOpenWindowsAutomatically = true
        configuration.preferences = preferences;
        
        var webview = WKWebView.init(frame: CGRectZero, configuration: configuration)
        webview.navigationDelegate = self;
        webview.uiDelegate = self
        webview.addObserver(self, forKeyPath: "title", options:[.new], context: nil)
        webview.addObserver(self, forKeyPath: "estimatedProgress", options:[.new], context: nil)
        
        return webview;
    }()
    
    lazy var myProgressView:UIProgressView = {
        let progressView = UIProgressView.init(frame: CGRect(x: 0, y: 0, width: UIScreen.main.bounds.width, height: 0))
        progressView.tintColor = UIColor.blue
        progressView.trackTintColor = UIColor.white
        return progressView
    }()
    

    /*
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        // Get the new view controller using segue.destination.
        // Pass the selected object to the new view controller.
    }
    */

}

extension TermiPassBaseWebviewController : WKNavigationDelegate,WKUIDelegate {
    
    open func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        decisionHandler(.allow)
    }
    
    public func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        print("load fail")
        print(error)
    }
    
    open func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {

    }
}
