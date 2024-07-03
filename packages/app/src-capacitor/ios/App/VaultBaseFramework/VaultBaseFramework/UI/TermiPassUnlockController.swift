//
//  TermiPassUnlockController.swift
//  VaultBaseFramework
//
//  Created by gjm on 11/23/23.
//

import Foundation

import UIKit
import LocalAuthentication
import BEMCheckBox
import PDFKit


open class TermiPassUnlockController: UIViewController {
    
    public var unClockStausCallBack: ((_ status: Bool) -> Void)?
    
    public var unlockApp: App?
    
    var hadCallBack = false
    
    var biometricIsAvailable: Bool = false {
        didSet {
            updatePasswordViewAndBiometricViewStatus()
            if (!biometricIsAvailable) {
                biometricType = .none
            }
        }
    }
    
    var biometricType = LABiometryType.none {
        didSet {
            touchIDImage.isHidden = true
            faceIDImage.isHidden = true
            
            switch biometricType {
            case .none:
                titleDetailLabel.text = "Enter the password to login to your Account"
            case .touchID:
                titleDetailLabel.text = "Scan your face to verify your identity"
                touchIDImage.isHidden = false
            case .faceID:
                titleDetailLabel.text = "Scan your face to verify your identity"
                faceIDImage.isHidden = false
                // ci暂时不支持 
//            case .opticID:
//                titleDetailLabel.text = "Scan your face to verify your identity"
//                faceIDImage.isHidden = false
            @unknown default:
                titleDetailLabel.text = "Enter the password to login to your Account"
            }
        }
    }
    
    func updatePasswordViewAndBiometricViewStatus() {
//        standardUserStore.openBiometric
        
        passwordView.isHidden = biometricIsAvailable && standardUserStore.openBiometric
        confirmButton.isHidden = passwordView.isHidden
        biometricBGImage.isHidden = !passwordView.isHidden
        
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
        super.viewDidLoad()
        configUI()
        
       
        unlockByBiometric()
     
    }
    
    func unlockByBiometric() {
        
        let biometricInfo = BiometricTool.isAvailable()
        
        biometricType = biometricInfo.biometricType
        
        biometricIsAvailable = biometricInfo.isAvailable
        
        if standardUserStore.openBiometric && biometricInfo.isAvailable{
            BiometricTool.verifyIdentity { status, message, callBackdata in
                DispatchQueue.main.async {
                    if !status {
                        self.biometricIsAvailable = false
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
            
            
            var errorStep: Int = 0
            var mnemonicssss = ""
            do {
                let result = try user._unlock(password: password)
                guard result != nil else {
                    callback(false,password)
                    return
                }
                errorStep = 1
                
                guard let mnemonicItem = user.mnemonics.get(id: standardUserStore.current_id) else {
                    callback(false,"empty user")
                    return
                }
                errorStep = 2
                
                guard let _unclockApp = self.unlockApp else {
//                    callback(false,"params error")
                    callback(true, "")
                    return
                }
                
                
                let state = VaultStorage.getData(key: _unclockApp.storageId(userid: standardUserStore.current_id))
                if let state = state as? String {
                    errorStep = 3
                    let jsonData:Data = state.data(using: .utf8)!
                    let dict = try? JSONSerialization.jsonObject(with: jsonData)
                    errorStep = 4
                    if let dict = dict as? [String: Any] {
                        guard let appState:AppState = AppState.deserialize(from: dict) else {
                            return
                        }
                        errorStep = 5
                        _unclockApp.load(appState: appState)
                        errorStep = 6
                        let mnemonics = mnemonicItem.mnemonic
                        mnemonicssss = mnemonics
                        try _unclockApp.unlock(password: mnemonics)
                        errorStep = 7
                    }
                }
                callback(true, "")
            } catch  {
                callback(false,"password is error\(errorStep) \(mnemonicssss)")
            }
        }
        
    }
    
    @objc func backAction() {
        self.dismiss(animated: true)
    }
    
    
    func configUI() {
        
        self.navigationItem.leftBarButtonItem = TermiPassBaseBarButtonItem.createBackButton(target: self, action: #selector(backAction))
        
        
        view.addSubview(self.setPasswordBGView)
        self.setPasswordBGView.snp.makeConstraints { make in
            make.edges.equalTo(self.view)
        }
        
        let labelTitle = UILabel()
        labelTitle.text = "Login"
        labelTitle.font = UIFont.systemFont(ofSize: 24, weight: .bold)
        labelTitle.textColor = UIColor.titleColor//UIColor.white
        self.setPasswordBGView.addSubview(labelTitle)
        
        labelTitle.snp.makeConstraints { make in
            make.left.equalTo(self.setPasswordBGView).offset(24)
            make.top.equalTo(self.setPasswordBGView).offset(22)
        }
        
        self.setPasswordBGView.addSubview(self.titleDetailLabel)
        
        titleDetailLabel.snp.makeConstraints { make in
            make.left.equalTo(self.setPasswordBGView).offset(24)
            make.right.equalTo(self.setPasswordBGView).offset(24)
            make.top.equalTo(labelTitle.snp.bottom).offset(8)
        }
        
        self.setPasswordBGView.addSubview(passwordView)
        
        passwordView.snp.makeConstraints { make in
            make.left.equalTo(labelTitle)
            make.right.equalTo(self.setPasswordBGView).offset(-24)
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
            make.top.equalTo(self.passwordView.snp.bottom).offset(97)
            make.height.equalTo(48)
        };
        
        self.useBioCheckBox.isHidden = standardUserStore.openBiometric
        checkBoxInfoLabel.isHidden = standardUserStore.openBiometric
        
    }
    
    lazy var titleDetailLabel: UILabel = {
        let titleDetail = UILabel()
        titleDetail.text = "Enter the password to login to your Account"
        titleDetail.font = UIFont.systemFont(ofSize: 14, weight: .regular)
        titleDetail.textColor = UIColor.subTitleColor//UIColor(white: 1, alpha: 0.5)
        return titleDetail
    }()
    
    lazy var setPasswordBGView: UIView = {
        let view = UIView()
        view.isUserInteractionEnabled = true
        view.backgroundColor = UIColor.white
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
    
    lazy var biometricBGImage: UIImageView = {
        let image = UIImageView(image: UIImage(named: "biometric_mark_bg"))
        
        image.addSubview(touchIDImage)
        image.addSubview(faceIDImage)
        
        touchIDImage.snp.makeConstraints { make in
            make.centerX.centerY.equalTo(image)
            make.size.equalTo(CGSizeMake(100, 100))
        }
        
        faceIDImage.snp.makeConstraints { make in
            make.centerX.centerY.equalTo(image)
            make.size.equalTo(CGSizeMake(100, 100))
        }
        
        return image
    }()
    
    lazy var touchIDImage: UIImageView = {
        let image = UIImageView(image: UIImage(named: "touch_id"))
        return image
    }()
    
    lazy var faceIDImage: UIImageView = {
        let image = UIImageView(image: UIImage(named: "face_id"))
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
        button.setTitle("Log in", for: .normal)
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
