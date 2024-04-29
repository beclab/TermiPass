//
//  TermiPassShareRootController.swift
//  TermipassShare
//
//  Created by gjm on 11/23/23.
//

import Foundation
import UIKit
import VaultBaseFramework

class TermiPassShareRootController: UIViewController {
    
    required init?(coder: NSCoder) {
        super.init(coder: coder)
        
        self.isModalInPresentation = true
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        TermiPassCookieShareManager.standManager.syncToSharedCookie()
        
        let cookies =  HTTPCookieStorage.shared.cookies
        tp_log(.default, message: "\(cookies ?? [])")
        
//        self.navigationItem.title = @"sasdfhjaksdjhf";
//        self.navigationItem.leftBarButtonItem = [[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemCancel target:self action:@selector(cancel:)];
//
        navigationItem.title = "Share to TermiPass";
        
        tp_log(.default, message: navigationItem.title ?? "")
        
        self.navigationItem.leftBarButtonItem = UIBarButtonItem(barButtonSystemItem: .cancel, target: self, action: #selector(cancel))
    }
    
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
        standardUserStore.load()

        guard standardUserStore.user != nil else {
//            AutoFillResponse.openHostApp(withVC: self, open: .Normal, info: nil)
            tp_log(.default, message: "standardUserStore.user empty")
            self.extensionContext?.completeRequest(returningItems: self.extensionContext?.inputItems, completionHandler: nil)
            return
        }

        jumpToUnLockVC()

    }
    
    func jumpToUnLockVC() {
        let unlockVC = TermiPassUnlockController()
        unlockVC.unClockStausCallBack = { status in
            if status {
                unlockVC.dismiss(animated: false) {
//                    self.upload()
                }
            } else {
                self.extensionContext?.completeRequest(returningItems: self.extensionContext?.inputItems, completionHandler: nil)
            }
        }
        self.present(TermiPassBaseNavigationController(rootViewController: unlockVC), animated: true);
    }
    
    
    func upload() {
//        for (NSExtensionItem *item in self.extensionContext.inputItems) {
//            for (NSItemProvider *itemProvider in item.attachments) {
//                dispatch_group_enter(provider.group);
//                Debug("itemProvider: %@", itemProvider);
//                if ([itemProvider hasItemConformingToTypeIdentifier:(NSString *)kUTTypeItem] || [itemProvider hasItemConformingToTypeIdentifier:@"public.url"]) {
//                    //image or ics need to call with "public.url" as identifier
//                    NSString *typeIdentifier = (NSString *)kUTTypeItem;
//                    if ([itemProvider hasItemConformingToTypeIdentifier:@"public.url"]) {
//                        typeIdentifier = @"public.url";
//                    }
//                    [itemProvider loadItemForTypeIdentifier:typeIdentifier options:nil completionHandler:^(id<NSSecureCoding, NSObject>  _Nullable item, NSError * _Null_unspecified error) {
//                        if (!error) {
//                            [provider loadMatchingItem:item provider:itemProvider handler:^(BOOL result) {
//                                dispatch_group_leave(provider.group);
//                            }];
//                        } else {
//                            [provider handleFailure:^(BOOL result) {
//                                dispatch_group_leave(provider.group);
//                            }];
//                        }
//                    }];
//                } else {
//                    [provider handleFailure:^(BOOL result) {
//                        dispatch_group_leave(provider.group);
//                    }];
//                }
//            }
//        };
        
        guard let inputItems = self.extensionContext?.inputItems else { return }
        
        for item in inputItems {
//            for itemProvider in item
            guard let extensionItem = item as? NSExtensionItem else {
                continue
            }
            
            guard let attachments = extensionItem.attachments else { continue }
            
            for itemProvider in attachments {
                
                if itemProvider.hasItemConformingToTypeIdentifier("public.item") || itemProvider.hasItemConformingToTypeIdentifier("public.url") {
                    var typeIdentifier = "public.item"
                    if itemProvider.hasItemConformingToTypeIdentifier("public.url") {
                        typeIdentifier = "public.url"
                    }
                    
                    itemProvider.loadItem(forTypeIdentifier: typeIdentifier, options: nil) { code, error in
                        if let error = error {
                            
                        } else {
                            
                        }
                    }
                }
                
            }
        }
//        self.extensionContext.inputItems
    }
    
    
    @objc func cancel() {
//        [self.extensionContext completeRequestReturningItems:self.extensionContext.inputItems completionHandler:nil];
        self.extensionContext?.completeRequest(returningItems: self.extensionContext?.inputItems, completionHandler: nil)
    }
}
