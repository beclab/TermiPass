//
//  UnlockController.swift
//  autofill
//
//  Created by gjm on 2023/4/26.
//

import Foundation
import UIKit
import VaultBaseFramework
import LocalAuthentication
import BEMCheckBox

public class UnlockController: UIViewController {
    
    public var unClockStausCallBack: ((_ status: Bool) -> Void)?
    
    var hadCallBack = false
            
    var biometricType = LABiometryType.none {
        didSet {
            touchIDImage.isHidden = true
            faceIDImage.isHidden = true
            
            switch biometricType {
            case .none:
                titleDetailLabel.text = "Enter the password to login to your Account"
            case .touchID:
                titleDetailLabel.text = "Need your touchid to verify your identity"
                touchIDImage.isHidden = false
            case .faceID:
                titleDetailLabel.text = "Scan your face to verify your identity"
                faceIDImage.isHidden = false
            @unknown default:
                titleDetailLabel.text = "Enter the password to login to your Account"
            }
        }
    }
    
    func updatePasswordViewAndBiometricViewStatus() {
//        passwordView.isHidden = biometricIsAvailable && standardUserStore.openBiometric
//        confirmButton.isHidden = passwordView.isHidden
//        biometricBGImage.isHidden = !passwordView.isHidden
        
    }
    
    public override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        
        if (!hadCallBack) {
            if let callBack = self.unClockStausCallBack {
                callBack(false)
            }
        }
    }
    
    public override func viewDidLoad() {
        configUI()
        unlockByBiometric()
    }
    
    @objc func unlockByBiometric() {
        
        let biometricInfo = BiometricTool.isAvailable()
        
        if standardUserStore.openBiometric && biometricInfo.isAvailable{
            BiometricTool.verifyIdentity { status, message, callBackdata in
                DispatchQueue.main.async {
                    if !status {
                        return
                    }

                    let passwordIden = try? BiometricTool.getCredentialsFromKeychain(standardUserStore.biometricServer)
                    if let passwordIden = passwordIden {
                        self.unlockWithPassword(password: passwordIden.password)
                    }
                }
                
            }
        } else {
            if (!standardUserStore.openBiometric && biometricInfo.isAvailable) {
                useBioCheckBox.isHidden = false
                checkBoxInfoLabel.isHidden = false
            }
        }
    }
    
    
    private func unlockWithPassword(password: String) {
        self.setupPassword(password:password) { status, errorMessage in
            DispatchQueue.main.async {
                if !status {
                    self.passwordView.errorStr = errorMessage
                    return
                }
                self.passwordView.errorStr = ""
                self.hadCallBack = true
                                                
                if self.useBioCheckBox.on {
                    UserStore.saveOpenBiometric(value: true)
                    try? BiometricTool.setCredentials(server: standardUserStore.biometricServer, username: standardUserStore.id, password: password)
                } else {
                    if !self.useBioCheckBox.isHidden && !self.useBioCheckBox.on {
                        UserStore.saveOpenBiometric(value: false)
                        try? BiometricTool.deleteCredentialsFromKeychain(standardUserStore.biometricServer)
                    }
                }

                if let callBack = self.unClockStausCallBack {
                    callBack(true)
                }
            }
        }
    }
    
    private func setupPassword(password: String, callback:@escaping (_ status: Bool, _ errorMessage: String) -> Void) {
        DispatchQueue.global().async {
            guard let user = standardUserStore.user else {
                callback(false,"empty user")
                return
            }
//            var errorStep: Int = 0
            do {
                let result = try user._unlock(password: password)
                guard result != nil else {
                    callback(false,password)
                    return
                }
//                errorStep = 1
                
                guard let mnemonicItem = user.mnemonics.get(id: standardUserStore.current_id) else {
                    callback(false,"empty user")
                    return
                }
//                errorStep = 2
                
                let state = VaultStorage.getData(key: autoFillapp.storageId(userid: standardUserStore.current_id))
                if let state = state as? String {
//                    errorStep = 3
                    let jsonData:Data = state.data(using: .utf8)!
                    let dict = try? JSONSerialization.jsonObject(with: jsonData)
//                    errorStep = 4
                    if let dict = dict as? [String: Any] {
                        guard let appState:AppState = AppState.deserialize(from: dict) else {
                            return
                        }
//                        errorStep = 5
                        autoFillapp.load(appState: appState)
//                        errorStep = 6
                        let mnemonics = mnemonicItem.mnemonic
                        do {
                            try autoFillapp.unlock(password: mnemonics)
                        } catch {
                
                        }
//                        errorStep = 7
                    }
                }
                callback(true, "")
            } catch  {
                callback(false,"password is error")
            }
        }
        
    }
    
    func configUI() {
                
        view.addSubview(self.setPasswordBGView)
        self.setPasswordBGView.snp.makeConstraints { make in
            make.edges.equalTo(self.view)
        }
        
        self.setPasswordBGView.addSubview(self.logoImageView)
        self.logoImageView.snp.makeConstraints { make in
            make.centerX.equalTo(self.setPasswordBGView);
            make.top.equalTo(self.setPasswordBGView).offset(37)
            make.size.equalTo(CGSizeMake(120, 120))
        }
        
        let labelTitle = UILabel()
        labelTitle.text = "Please enter your password to unlock TermiPass."
        labelTitle.font = UIFont.systemFont(ofSize: 14, weight: .medium)
        labelTitle.textColor = UIColor.subTitleColor
        self.setPasswordBGView.addSubview(labelTitle)
        
        labelTitle.snp.makeConstraints { make in
            make.centerX.equalTo(self.setPasswordBGView)
            make.top.equalTo(self.logoImageView.snp.bottom).offset(20)
        }
        
        self.setPasswordBGView.addSubview(self.titleDetailLabel)
        
        titleDetailLabel.snp.makeConstraints { make in
            make.left.equalTo(self.setPasswordBGView).offset(24)
            make.right.equalTo(self.setPasswordBGView).offset(24)
            make.top.equalTo(labelTitle.snp.bottom).offset(64)
        }
        
        self.setPasswordBGView.addSubview(passwordView)
        
        passwordView.snp.makeConstraints { make in
            make.left.equalTo(self.setPasswordBGView).offset(16)
            make.right.equalTo(self.setPasswordBGView).offset(-16)
            make.top.equalTo(self.titleDetailLabel.snp.bottom).offset(36)
        }
        
        
        self.setPasswordBGView.addSubview(useBioCheckBox)
        useBioCheckBox.snp.makeConstraints { make in
            make.top.equalTo(passwordView.snp.bottom).offset(20)
            make.left.equalTo(passwordView)
            make.size.equalTo(CGSize(width: 20, height: 20))
        };
        
        self.setPasswordBGView.addSubview(self.checkBoxInfoLabel)
        //
        self.checkBoxInfoLabel.snp.makeConstraints { make in
            make.left.equalTo(useBioCheckBox.snp.right)
            make.centerY.equalTo(useBioCheckBox)
            make.height.equalTo(30)
            make.right.equalTo(self.passwordView)
        }
        
        
        self.setPasswordBGView.addSubview(self.confirmButton)
        self.confirmButton.snp.makeConstraints { make in
            make.left.right.equalTo(self.passwordView)
            make.bottom.equalTo(self.setPasswordBGView).offset(-97)
            make.height.equalTo(48)
        };
        
        self.setPasswordBGView.addSubview(self.biometricBGImage);
        self.biometricBGImage.snp.makeConstraints { make in
            make.bottom.equalTo(self.confirmButton.snp.top).offset(-40)
            make.size.equalTo(CGSizeMake(48, 48))
            make.centerX.equalTo(self.setPasswordBGView)
        };
        
        print(standardUserStore.openBiometric)
        
        self.useBioCheckBox.isHidden = standardUserStore.openBiometric
        checkBoxInfoLabel.isHidden = standardUserStore.openBiometric
        self.biometricBGImage.isHidden = !standardUserStore.openBiometric
//
        let biometricInfo = BiometricTool.isAvailable()
//        
        biometricType = biometricInfo.biometricType
    }
    
    lazy var logoImageView: UIImageView = {
        let imageV = UIImageView(image: UIImage(named: "newSplash"))
        return imageV
    }()
    
    lazy var titleDetailLabel: UILabel = {
        let titleDetail = UILabel()
        titleDetail.text = "Enter the password to login to your Account"
        titleDetail.font = UIFont.systemFont(ofSize: 14)
        titleDetail.textColor = UIColor(white: 1, alpha: 0.5)
        return titleDetail
    }()
    
    lazy var setPasswordBGView: UIView = {
        let view = UIView()
        view.isUserInteractionEnabled = true
        view.backgroundColor = UIColor.white;
        return view
    }()
    
    lazy var passwordView: TermiPassBaseEdit = {
        let editView = TermiPassBaseEdit(frame: CGRect(x: 0, y: 0, width: screenWidth - 48, height: 0))
        editView.title = "Password"
        editView.isPassword = true
        
        editView.textDidUpdate = { text in
            self.confirmButton.status = ( text != nil && text?.count ?? 0 > 0) ? .normal : .disable
        }
        
        return editView
    }()
    
    lazy var biometricBGImage: UIControl = {
        let image = UIControl()
        
        image.addSubview(touchIDImage)
        image.addSubview(faceIDImage)
        
        touchIDImage.snp.makeConstraints { make in
            make.centerX.centerY.equalTo(image)
            make.size.equalTo(CGSizeMake(48, 48))
        }
        
        faceIDImage.snp.makeConstraints { make in
            make.centerX.centerY.equalTo(image)
            make.size.equalTo(CGSizeMake(48, 48))
        }
        
        image.addTarget(self, action: #selector(unlockByBiometric), for: .touchUpInside)
        
        return image
    }()
    
    lazy var touchIDImage: UIImageView = {
        let image = UIImageView(image: UIImage(named: "touch_id")?.withTintColor(UIColor.titleColor ?? .black, renderingMode: .alwaysOriginal))
        return image
    }()
    
    lazy var faceIDImage: UIImageView = {
        let image = UIImageView(image: UIImage(named: "face_id")?.withTintColor(UIColor.titleColor ?? .black, renderingMode: .alwaysOriginal))
        return image
    }()
    
    
    lazy var setupSuccessView: UIView = {
        let view = UIView()
        view.isUserInteractionEnabled = false
        let successLabel = UILabel()
        successLabel.font = UIFont.systemFont(ofSize: 20)
        successLabel.textColor = UIColor.blue
        successLabel.text = "Setup Master Password Success"
        successLabel.textAlignment = .center
        
        view.addSubview(successLabel)
        successLabel.snp.makeConstraints { make in
            make.centerX.equalTo(view)
            make.top.equalTo(view).offset(120)
        }
        
        return view
    }()
    
    
    lazy var useBioCheckBox: BEMCheckBox = {
        let checkBox = BEMCheckBox(frame: CGRect.init(x: 0, y: 0, width: 20, height: 20))
        checkBox.onTintColor = UIColor(hex: "#FEF153") ?? UIColor.blue
        checkBox.onFillColor =  UIColor(hex: "#FEF153") ?? UIColor.blue
        checkBox.onCheckColor = UIColor.black
        checkBox.lineWidth = 1.5
        return checkBox
    }()
    
    lazy var checkBoxInfoLabel: UIControl = {
        let control = UIControl()
        
        let bioReminderLabel = UILabel()
        bioReminderLabel.text = "Unlock with biometrics next time"
        bioReminderLabel.font = UIFont.systemFont(ofSize: 14, weight: .regular)
        bioReminderLabel.textColor = UIColor.subTitleColor
        control.addSubview(bioReminderLabel)
        //
        bioReminderLabel.snp.makeConstraints { make in
            make.left.equalTo(control).offset(10)
            make.centerY.equalTo(control)
        }
        
        control.addTarget(self, action: #selector(checkboxAction), for: .touchUpInside)
        
        return control
    }()
    
    
    lazy var confirmButton: TermiPassBaseConfirmButton = {
        let button = TermiPassBaseConfirmButton(frame: CGRectZero)
        button.setTitle("Unlock", for: .normal)
        button.status = .disable
        button.buttonAction = {
            if self.confirmButton.status != .error {
                if let password = self.passwordView.text {
                    self.unlockWithPassword(password: password)
                }
            }
        }
        return button
    }()
    
    
    @objc func checkboxAction() {
        useBioCheckBox.setOn(!useBioCheckBox.on, animated: true)
    }
}
