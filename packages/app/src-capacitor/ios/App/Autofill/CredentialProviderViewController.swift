//
//  CredentialProviderViewController.swift
//  autofill
//
//  Created by gjm on 2023/2/8.
//

import AuthenticationServices
import VaultBaseFramework
import SnapKit

class CredentialProviderViewController: ASCredentialProviderViewController {
    
    /*
     Prepare your UI to list available credentials for the user to choose from. The items in
     'serviceIdentifiers' describe the service the user is logging in to, so your extension can
     prioritize the most relevant credentials in the list.
     */
    var data: [AppOrWebIdentifyModel] = []
    
    var credentialIdentity : ASPasswordCredentialIdentity?
    
    override func prepareCredentialList(for serviceIdentifiers: [ASCredentialServiceIdentifier]) {
        if serviceIdentifiers.count == 0 {
            return
        }
        
        serviceIdentifiers.forEach { serv in
            data.append(AppOrWebIdentifyModel(identifier: serv.identifier, type: IdentifyType(rawValue: serv.type.rawValue) ?? .web))
        }
        
       
    }
    override func viewDidLoad() {
        super.viewDidLoad()
        
        view.backgroundColor = UIColor.white
        if self.logoImageView.superview == nil {
            view.addSubview(self.logoImageView)
            self.logoImageView.snp.makeConstraints { make in
                make.top.equalTo(view).offset(120)
                make.centerX.equalTo(view)
                make.size.equalTo(CGSizeMake(160, 160))
            }
        }

    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
        standardUserStore.load()

        guard standardUserStore.user != nil else {
            AutoFillResponse.openHostApp(withVC: self, open: .Normal, info: nil)
            return
        }

        jumpToUnLockVC()

    }
    
    func jumpToUnLockVC() {
        let unlockVC = UnlockController()
        unlockVC.unClockStausCallBack = { status in
            if status {
                unlockVC.dismiss(animated: false) {
                    if self.data.count == 0 && self.credentialIdentity == nil {
                        self.jumpToLockSuccessVC()
                    } else {
                        if self.credentialIdentity != nil {
                            self.unlockByCredentialIdentity()
                            return
                        }
                        self.jumpToVaultListVC()
                    }
                   
                }
            } else {
                self.extensionContext.cancelRequest(withError: NSError(domain: ASExtensionErrorDomain, code: ASExtensionError.userCanceled.rawValue))
            }
        }
        self.present(unlockVC, animated: true);
    }
    
    func jumpToLockSuccessVC() {
        let successVC = UnlockSuccessController()
        successVC.closeBlock = {
            self.extensionContext.cancelRequest(withError: NSError(domain: ASExtensionErrorDomain, code: ASExtensionError.userCanceled.rawValue))
        }
        self.present(TermiPassBaseNavigationController(rootViewController: successVC), animated: true);
    }
    
    func jumpToVaultListVC() {
        
        let listVC = AutofillListController()
        listVC.reloadData(data: data)
        listVC.modalPresentationStyle = .fullScreen  
        listVC.callBack = {status ,datas in
            if status {
                let passwordCredential = ASPasswordCredential(user: datas[0], password: datas[1])
                self.extensionContext.completeRequest(withSelectedCredential: passwordCredential, completionHandler: nil)
            }
        }
        listVC.closeBlock = {
            self.extensionContext.cancelRequest(withError: NSError(domain: ASExtensionErrorDomain, code: ASExtensionError.userCanceled.rawValue))
        }
//        self.present(listVC, animated: true)
        self.present(TermiPassBaseNavigationController(rootViewController: listVC), animated: true);
    }
    
    func unlockByCredentialIdentity() {
        if let credentialIdentity = self.credentialIdentity {
            if let id = credentialIdentity.recordIdentifier {
                let datas = VaultItem.filterInfoById(id: id)
                
                if datas.password.count > 0 && datas.username.count > 0 {
                    let passwordCredential = ASPasswordCredential(user: datas.username, password: datas.password)
                    self.extensionContext.completeRequest(withSelectedCredential: passwordCredential, completionHandler: nil)
                    return
                }
            }
        }
        
        self.extensionContext.cancelRequest(withError: NSError(domain: ASExtensionErrorDomain, code: ASExtensionError.credentialIdentityNotFound.rawValue))
    }

    override func provideCredentialWithoutUserInteraction(for credentialIdentity: ASPasswordCredentialIdentity) {
        self.extensionContext.cancelRequest(withError: NSError(domain: ASExtensionErrorDomain, code:ASExtensionError.userInteractionRequired.rawValue))
    }
    
    override func prepareInterfaceToProvideCredential(for credentialIdentity: ASPasswordCredentialIdentity) {
        self.credentialIdentity = credentialIdentity
    }
    

    lazy var logoImageView: UIImageView = {
        let imageView = UIImageView(image: UIImage(named: "newSplash"))
        return imageView
    }()
}
