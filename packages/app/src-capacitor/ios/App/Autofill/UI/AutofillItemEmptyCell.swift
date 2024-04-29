//
//  AutofillItemEmptyCell.swift
//  autofill
//
//  Created by gjm on 2023/4/27.
//

import Foundation
import VaultBaseFramework
import SnapKit

public class AutofillItemEmptyCell: UITableViewCell {
    
    override init(style: UITableViewCell.CellStyle, reuseIdentifier: String?) {
        super.init(style: style, reuseIdentifier: reuseIdentifier)
        self.configueUI()
    }
    
    func configueUI() {
        self.contentView.backgroundColor = UIColor.white
        self.contentView.addSubview(self.emptyImageView)
        self.emptyImageView.snp.makeConstraints { make in
            make.centerX.top.equalTo(self.contentView);
            make.size.equalTo(CGSizeMake(160, 160))
        };
        
        self.contentView.addSubview(self.detailLabel)
        self.detailLabel.snp.makeConstraints { make in
            make.centerX.equalTo(self.contentView)
            make.top.equalTo(self.emptyImageView.snp.bottom).offset(8)
        }
        
        self.contentView.addSubview(self.addButton)
        
        self.addButton.snp.makeConstraints { make in
            make.centerX.equalTo(self.contentView)
            make.top.equalTo(self.detailLabel.snp.bottom).offset(8)
            make.width.equalTo(126)
            make.height.equalTo(32)
        }
    }
    
    lazy var emptyImageView: UIImageView = {
        let image = UIImageView(image: UIImage(named: "autofill_empty_img"))
        return image
    }()
    
    public lazy var detailLabel: UILabel = {
        let label = UILabel()
        label.textColor = UIColor.subTitleColor
        label.font = UIFont.systemFont(ofSize: 12)
        label.text = "No information"
        return label
    }()
    
    lazy var addButton: TermiPassBaseConfirmButton = {
        let button = TermiPassBaseConfirmButton(frame: CGRect.zero)
        button.setTitle("Add", for: .normal)
        button.layer.cornerRadius = 16
        return button
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
