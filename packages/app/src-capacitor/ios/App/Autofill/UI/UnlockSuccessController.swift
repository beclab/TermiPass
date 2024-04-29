//
//  UnlockSuccessController.swift
//  App
//
//  Created by gjm on 2023/4/27.
//

import Foundation
import UIKit
import SnapKit

class UnlockSuccessController: UIViewController {
    
    public var closeBlock: (() -> Void)?
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        configUI()
    }
    
    @objc func backAction() {
        self.dismiss(animated: true)
    }
    
    
    func configUI() {
        view.backgroundColor = UIColor.white
        view.addSubview(self.logoImage)
        self.logoImage.snp.makeConstraints { make in
            make.centerX.equalTo(self.view)
            make.top.equalTo(self.view).offset(160)
            make.size.equalTo(CGSizeMake(72, 72))
        }
        
        view.addSubview(self.successLabel)
        self.successLabel.snp.makeConstraints { make in
            make.top.equalTo(self.logoImage.snp.bottom).offset(12)
            make.centerX.equalTo(view)
        }
        
        self.navigationItem.leftBarButtonItem = TermiPassBaseBarButtonItem.createBackButton(target: self, action: #selector(backAction))
        self.navigationItem.title = "TermiPass"
    }
    
    
    let logoImage:UIImageView = {
        let imageView = UIImageView(image: UIImage(named: "unlock_success"))
        
        return imageView
    }()
    
    let successLabel: UILabel = {
        let label = UILabel()
        label.font = UIFont.systemFont(ofSize: 20)
        label.textColor = UIColor.titleColor
        label.text = "Setup autofill success"
        
        return label
    }()

    
    override func viewDidDisappear(_ animated: Bool) {
        super.viewDidDisappear(animated)
        if let block = self.closeBlock {
            block()
        }
    }
    
}
