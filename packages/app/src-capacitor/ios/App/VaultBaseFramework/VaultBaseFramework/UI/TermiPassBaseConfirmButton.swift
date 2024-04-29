//
//  ConfirmButton.swift
//  VaultBaseFramework
//
//  Created by gjm on 2023/4/27.
//

import UIKit


public enum ConfirButtonStatus {
    case normal
    case error
    case disable
    
}

open class TermiPassBaseConfirmButton: UIButton {
    
    public var buttonAction: (() -> Void)?
    
    
    public var status: ConfirButtonStatus = .normal {
        didSet {
            switch status {
            case .normal:
                self.isEnabled = true
                if let color = UIColor(hex: "#FEF153") {
                    self.setBackgroundImage(TermiPassImage.createRectImage(color: color, size: CGSize(width: 1, height: 1)), for: .normal)
                }
            case .error:
                self.isEnabled = true
                if let color = UIColor(hex: "#FF5935") {
                    self.setBackgroundImage(TermiPassImage.createRectImage(color: color, size: CGSize(width: 1, height: 1)), for: .normal)
                }
            case .disable:
                self.isEnabled = false
            }
        }
    }
    
    public override init(frame: CGRect) {
        super.init(frame: frame)
        configUI()
    }
    
    func configUI() {
        self.setTitleColor(UIColor.titleColor, for: .normal)
        self.titleLabel?.font = UIFont.systemFont(ofSize: 16, weight: .regular)
        self.backgroundColor = UIColor(hex: "#FEF153")
        self.layer.cornerRadius = 24
        self.layer.masksToBounds = true
        
        if let color = UIColor(hex: "#FEF153") {
            self.setBackgroundImage(TermiPassImage.createRectImage(color: color, size: CGSize(width: 1, height: 1)), for: .normal)
        }
        
        if let color = UIColor(hex: "#FFF8BF") {
            self.setBackgroundImage(TermiPassImage.createRectImage(color: color, size: CGSize(width: 1, height: 1)), for: .disabled)
        }
        
        self.addTarget(self, action: #selector(buttonOnClick), for: .touchUpInside)
    }
    
    @objc func buttonOnClick() {
        if let actionBlock = self.buttonAction  {
            actionBlock()
        }
    }
    
    required public init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
}
