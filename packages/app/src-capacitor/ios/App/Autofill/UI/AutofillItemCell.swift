//
//  AutofillItemCell.swift
//  autofill
//
//  Created by gjm on 2023/2/16.
//

import UIKit
import SnapKit
import Kingfisher

public class AutofillItemCell: UITableViewCell {
    
    public func loadImage(identify: String, type: IdentifyType) {
        if type == .web {
            var host = identify
            var scheme = ""
            if identify.starts(with: "http"),let url = URL(string: identify) {
                host = url.host ?? ""
                scheme = url.scheme ?? ""
            }
            if let url = URL(string: "\(scheme)://\(host)/favicon.ico"),host.count > 0,scheme.count > 0 {
                self.iconImageView.kf.setImage(with: url, placeholder: nil, options: nil, progressBlock: nil) { [self]
                    result in
                    switch result {
                    case .success(let value):
                        self.configueWebImage(webImage: value.image)
                        
                    case .failure(let error):
                        print("Job failed: \(error.localizedDescription)")
                        self.configueWebImage(webImage: nil)
                    }
                }
            } else {
                configueWebImage(webImage: nil)
            }
        } else {
            configAppImage()
        }
    }
    
    func configueWebImage(webImage: UIImage?) {
        if let webImage = webImage {
//            self.iconBG.backgroundColor = UIColor.white
            self.iconImageView.image = webImage
        } else {
//            self.iconBG.backgroundColor = UIColor(hex: "#5BCCF3")
            self.iconImageView.image = UIImage(named: "autofill_web_default_icon")
        }
    }
    
    func configAppImage() {
//        self.iconBG.backgroundColor = UIColor.clear
        self.iconImageView.image = UIImage(systemName: "network")?.withTintColor(UIColor.titleColor ?? .black, renderingMode: .alwaysOriginal)
    }
    
    override init(style: UITableViewCell.CellStyle, reuseIdentifier: String?) {
        super.init(style: style, reuseIdentifier: reuseIdentifier)
        self.configueUI()
    }
    
    private func configueUI() {
        self.contentView.backgroundColor = UIColor(hex: "#F6F6F6")
        self.contentView.addSubview(self.iconImageView)
        self.contentView.layer.cornerRadius = 16
        self.contentView.layer.masksToBounds = true
        
        self.iconImageView.snp.makeConstraints { make in
            make.left.equalTo(self.contentView).offset(16)
            make.top.equalTo(self.contentView).offset(18)
            make.size.equalTo(CGSizeMake(24, 24))
        }
        
        self.contentView.addSubview(self.vaultName)
        self.vaultName.snp.makeConstraints { make in
            make.left.equalTo(self.iconImageView.snp.right).offset(10)
            make.top.equalTo(self.contentView).offset(12)
        }
        
        self.contentView.addSubview(self.name)
        self.name.snp.makeConstraints { make in
            make.left.equalTo(self.vaultName)
            make.top.equalTo(self.vaultName.snp.bottom).offset(2)
        }
        
        self.contentView.addSubview(self.usernameImage)
        self.usernameImage.snp.makeConstraints { make in
            make.left.equalTo(self.contentView).offset(24);
            make.top.equalTo(self.iconImageView.snp.bottom).offset(15);
            make.size.equalTo(CGSizeMake(20, 20))
        }
        
        self.contentView.addSubview(self.usernameTitleLabel)
        self.usernameTitleLabel.snp.makeConstraints { make in
            make.left.equalTo(self.usernameImage.snp.right).offset(4)
            make.centerY.equalTo(self.usernameImage)
        };
        
        self.contentView.addSubview(self.username)
        self.username.snp.makeConstraints { make in
            make.left.equalTo(self.usernameImage)
            make.top.equalTo(self.usernameImage.snp.bottom).offset(2)
            make.width.lessThanOrEqualTo((screenWidth - 40)/4)
        }

        self.contentView.addSubview(self.passwordImage)
        self.passwordImage.snp.makeConstraints { make in
            make.left.equalTo(self.contentView).offset((screenWidth - 40)/4 + 20)
            make.centerY.equalTo(self.usernameImage)
            make.size.equalTo(CGSizeMake(20, 20))
        }
        
        self.contentView.addSubview(self.passwordTitleLabel)
        self.passwordTitleLabel.snp.makeConstraints { make in
            make.left.equalTo(self.passwordImage.snp.right).offset(4)
            make.centerY.equalTo(self.usernameImage)
        };
        
        self.contentView.addSubview(self.password)
        self.password.snp.makeConstraints { make in
            make.left.equalTo(self.passwordImage)
            make.top.equalTo(self.passwordImage.snp.bottom).offset(2)
            make.width.lessThanOrEqualTo((screenWidth - 40)/4)
        }

        self.contentView.addSubview(self.urlImage)
        self.urlImage.snp.makeConstraints { make in
            make.left.equalTo(self.contentView).offset((screenWidth - 40)/2 + 20)
            make.centerY.equalTo(self.usernameImage)
            make.size.equalTo(CGSizeMake(20, 20))
        }
        
        self.contentView.addSubview(self.urlTitleLabel)
        self.urlTitleLabel.snp.makeConstraints { make in
            make.left.equalTo(self.urlImage.snp.right).offset(4)
            make.centerY.equalTo(self.usernameImage)
        };
        
        self.contentView.addSubview(self.url)
        self.url.snp.makeConstraints { make in
            make.left.equalTo(self.urlImage)
            make.top.equalTo(self.urlImage.snp.bottom).offset(2)
            make.width.lessThanOrEqualTo((screenWidth - 40)/4)
        }
    }
    
//    public lazy var iconBG: UIView = {
//        let bg = UIView()
//        bg.layer.cornerRadius = 20
//        bg.backgroundColor = UIColor.white
//        
//        bg.addSubview(self.iconImageView)
//        
//        self.iconImageView.snp.makeConstraints { make in
//            make.size.equalTo(CGSizeMake(24, 24))
//            make.centerY.centerX.equalTo(bg)
//        }
//        
//        return bg
//    }()
//    
    public lazy var iconImageView: UIImageView = {
        let image = UIImageView()
        return image
    }()
    
    public lazy var vaultName: UILabel = {
        let label = UILabel()
        label.textColor = UIColor.grey8Color
        label.font = UIFont.systemFont(ofSize: 12)
        label.textAlignment = .left
        return label
    }()

    
    public lazy var name: UILabel = {
        let label = UILabel()
        label.textColor = UIColor.titleColor
        label.font = UIFont.systemFont(ofSize: 14)
        label.textAlignment = .left
        return label
    }()
    
    public lazy var usernameImage: UIImageView = {
        let image = UIImageView()
        image.image = UIImage(systemName: "person.crop.circle")?.withTintColor(UIColor.blue4Color ?? UIColor.blue, renderingMode: .alwaysOriginal)
        return image
    }()
    
    public lazy var usernameTitleLabel: UILabel = {
        let label = UILabel()
        label.textColor = UIColor.blue4Color
        label.text = "Username"
        label.font = UIFont.systemFont(ofSize: 10)
        return label
    }()
    
    public lazy var username: UILabel = {
        let label = UILabel()
        label.textColor = UIColor.grey8Color
        label.font = UIFont.systemFont(ofSize: 12)
        return label
    }()
    


    public lazy var passwordImage: UIImageView = {
        let image = UIImageView()
        image.image = UIImage(systemName: "key.horizontal")?.withTintColor(UIColor.blue4Color ?? UIColor.blue, renderingMode: .alwaysOriginal)
        return image
    }()
    
    public lazy var passwordTitleLabel: UILabel = {
        let label = UILabel()
        label.textColor = UIColor.blue4Color
        label.text = "Password"
        label.font = UIFont.systemFont(ofSize: 10)
        return label
    }()
    
    public lazy var password: UILabel = {
        let label = UILabel()
        label.textColor = UIColor.grey8Color
        label.font = UIFont.systemFont(ofSize: 12)
        return label
    }()
    
    
    public lazy var urlImage: UIImageView = {
        let image = UIImageView()
        image.image = UIImage(systemName: "network")?.withTintColor(UIColor.blue4Color ?? UIColor.blue, renderingMode: .alwaysOriginal)
        return image
    }()
    
    public lazy var urlTitleLabel: UILabel = {
        let label = UILabel()
        label.textColor = UIColor.blue4Color
        label.text = "URL"
        label.font = UIFont.systemFont(ofSize: 10)
        return label
    }()
    
    public lazy var url: UILabel = {
        let label = UILabel()
        label.textColor = UIColor.grey8Color
        label.font = UIFont.systemFont(ofSize: 12)
        return label
    }()
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    public override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }
    
    public override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)
        
        // Configure the view for the selected state
    }
    
}
