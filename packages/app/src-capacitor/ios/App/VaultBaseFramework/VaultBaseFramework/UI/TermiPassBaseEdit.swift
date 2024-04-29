//
//  TerminusEdit.swift
//  VaultBaseFramework
//
//  Created by gjm on 2023/4/26.
//

import UIKit
import SnapKit

public enum EditStatus{
    case normal
    case editing
    case error
}

open class TermiPassBaseEdit: UIView {
    
    public var text:String? {
        get {
            return self.textfield.text
        }
    }
    
    public var textDidUpdate: ((_ text: String?) -> Void)?
    
    public var title: String = "" {
        didSet {
            titleBG.snp.updateConstraints { make in
                make.height.equalTo(title.count > 0 ? 25 : 0)
            }
            titleLabel.text = title
            titleBG.isHidden = title.count == 0;
        }
    }
    
    public var editStatus: EditStatus = .normal {
        didSet {
            switch editStatus {
            case .normal:
                TermiPassBaseBackgroundGradientLayerView.commonBorder(view: self.bgView)
            case .editing:
                TermiPassBaseBackgroundGradientLayerView.commonBorder(view: self.bgView)
            case .error:
                TermiPassBaseBackgroundGradientLayerView.errorBorder(view: self.bgView)
            }
        }
    }
    
    public var isPassword: Bool = false {
        didSet {
//            if (self.passwordImg.superview != nil) {
//                self.passwordImg.snp.updateConstraints { make in
//                    make.width.equalTo(isPassword ? 32 : 16)
//                }
//            }
//            self.passwordImg.isHidden = !isPassword
        }
    }
    
    public var isShowPassword: Bool = false {
        didSet {
            self.textfield.isSecureTextEntry = isShowPassword
            self.showPasswordBtn.setImage(UIImage(named: isShowPassword ? "password_hide" : "password_show"), for: .normal)
        }
    }
    
    
    public var errorStr: String = "" {
        didSet {
            self.errorInfo.snp.updateConstraints { make in
                make.top.equalTo(self.bgView.snp.bottom).offset(errorStr.count > 0 ? 8 : 0)
            }
            
            self.errorInfo.isHidden = errorStr.count == 0
            self.errorInfo.text = errorStr
        }
    }
    
    
    public override init(frame: CGRect) {
        super.init(frame: frame)
        configUI()
    }
    
    func configUI() {
        
        addSubview(self.titleBG)
        self.titleBG.snp.makeConstraints { make in
            make.left.right.top.equalTo(self)
            make.height.equalTo(0)
        }
        
        addSubview(bgView)
        bgView.snp.makeConstraints { make in
            make.left.right.equalTo(self)
            make.top.equalTo(self.titleBG.snp.bottom)
            make.height.equalTo(36)
        }
        
//        bgView.addSubview(passwordImg);
        
//        addSubview(passwordImg)
        
//        passwordImg.snp.makeConstraints { make in
//            make.width.equalTo(16)
//            make.height.bottom.equalTo(self.bgView)
//            make.left.equalTo(self.bgView).offset(16)
//        }
        
        bgView.addSubview(self.textfield)
        self.textfield.snp.makeConstraints { make in
            make.left.equalTo(self.bgView).offset(16)
            make.centerY.equalTo(self.bgView)
            make.right.equalTo(self.bgView).offset(-48)
            make.height.equalTo(self.bgView)
        }
        
        bgView.addSubview(self.showPasswordBtn)
        self.showPasswordBtn.snp.makeConstraints { make in
            make.right.top.bottom.equalTo(self.bgView)
            make.width.equalTo(48)
        }
        
        self.addSubview(self.errorInfo)
        
        self.errorInfo.snp.makeConstraints { make in
            make.left.right.equalTo(self.bgView)
            make.top.equalTo(self.bgView.snp.bottom).offset(0)
            make.bottom.equalTo(self)
        }
        
        
        self.textfield.addTarget(self, action: #selector(textDidChange), for: .editingChanged)

        editStatus = .normal
    }
    
    @objc func textDidChange() {
        if let updateBlock = self.textDidUpdate {
            updateBlock(self.textfield.text)
        }
    }
    
    lazy var titleBG : UIView = {
        let view = UIView()
        view.addSubview(titleLabel);
        
        titleLabel.snp.makeConstraints { make in
            make.left.top.equalTo(view)
            make.height.equalTo(17)
        }
        return view
    }()
    
    lazy var titleLabel: UILabel = {
        let label = UILabel()
        label.textColor = UIColor.labelColor
        label.font = UIFont.systemFont(ofSize: 12)
        return label
    }()
    
    lazy var bgView: UIView = {
        let view = UIView()
//        view.layer.insertSublayer(TermiPassBaseBackgroundGradientLayerView.createBG(size: CGSize(width: self.frame.size.width, height: 48)), at: 0)
//        view.layer.borderColor = UIColor.red.cgColor
//        view.layer.borderWidth = 1
        view.layer.cornerRadius = 8
        view.layer.masksToBounds = true
        view.backgroundColor = UIColor.white;
        TermiPassBaseBackgroundGradientLayerView.commonBorder(view: view)
        return view
    }()
    
    
//    lazy var passwordImg: UIView = {
//        let view = UIView()
//        
//        let imageView = UIImageView(image:UIImage(named: "password_key"))
//        view.addSubview(imageView)
//        imageView.snp.makeConstraints { make in
//            make.left.equalTo(view)
//            make.centerY.equalTo(view)
//            make.width.height.equalTo(16)
//        }
//        return view
//    }()
    
    lazy var textfield: UITextField = {
        let textfield = UITextField()
        textfield.textColor = UIColor.titleColor
        textfield.font = UIFont.systemFont(ofSize: 14, weight: .regular)
        textfield.delegate = self
        return textfield
    }()
    

    
    @objc func passwordBtnClick() {
        self.isShowPassword = !self.isShowPassword
    }
    
    lazy var showPasswordBtn: UIButton = {
        let button = UIButton()
        button.setImage(UIImage(named: "password_hide"), for: .normal)
        button.addTarget(self, action: #selector(passwordBtnClick), for: .touchUpInside)
        return button
    }()
        
    lazy var errorInfo: UILabel = {
        let label = UILabel()
        label.textColor = UIColor(hex: "#FF5935")
        label.font = UIFont.systemFont(ofSize: 12)
        label.isHidden = true
        label.numberOfLines = 0
        return label
    }()
    
    required public init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
}

extension TermiPassBaseEdit: UITextFieldDelegate {
    public func textFieldDidBeginEditing(_ textField: UITextField) {
        self.editStatus = .editing
    }
    
    public func textFieldDidEndEditing(_ textField: UITextField) {
        self.editStatus = .normal
    }
}
