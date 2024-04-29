//
//  AutofillListController.swift
//  autofill
//
//  Created by gjm on 2023/2/8.
//

let defaultHidePasswordString = "**********************"

import UIKit
import SnapKit
import HandyJSON
//import DZNEmptyDataSet

class AutofillListController: UIViewController {
    
    public var callBack: ((_ status: Bool, _ data: [String]) -> Void)?
    
    public var closeBlock: (() -> Void)?

    var data:[AppOrWebIdentifyModel] = []
    
    public func reloadData(data:[AppOrWebIdentifyModel]) {
        self.data = data
    }
    
    private var vaultItems : [VaultFilter] = []
    
    private func reloadMatchData() {
        if self.data.count == 0 {
            return
        }
        
        let firstItem = self.data[0]
        
        
        self.navigationItem.title = firstItem.identifier;
        
        self.vaultItems = firstItem.type.loginFilter(identify: firstItem.identifier)
        
//        if self.vaultItems.count == 1,let callBack = callBack {
//            let item = self.vaultItems[0]
//            let datas = item.filterPasswordAndUserName()
//            callBack(true,[datas.username,datas.password])
//            return
//        }
//
        self.tableView.reloadData()
    }
    
    override func viewDidDisappear(_ animated: Bool) {
        super.viewDidDisappear(animated)
        if let block = self.closeBlock {
            block()
        }
    }
    
    @objc func backAction() {
        self.dismiss(animated: true)
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor.white
        
        self.navigationItem.leftBarButtonItem = TermiPassBaseBarButtonItem.createBackButton(target: self, action: #selector(backAction))
        
        self.navigationItem.rightBarButtonItem = self.rightBarItem
        self.navigationItem.title = "TermiPass"
                
        view.addSubview(self.tableView);
        self.tableView.snp.makeConstraints { make in
            make.left.equalTo(self.view).offset(20)
            make.right.equalTo(self.view).offset(-20)
            make.top.bottom.equalTo(self.view)
        }
        
        reloadMatchData()
    }
    
    lazy var rightBarItem: UIBarButtonItem = {
        let confirmItem = UIBarButtonItem(image: UIImage(named: "bar_add_vault"), style: .plain, target: self, action: #selector(toAddVault))
        confirmItem.tintColor = UIColor.titleColor
        return confirmItem
    }()
    
    @objc func toAddVault() {
        if self.data.count > 0 {
            AutoFillResponse.openHostApp(withVC: self, open: .Add, info: [AppParamsUrlTools.identify :self.data[0].identifier])
        }
    }
    
    /*
     // MARK: - Navigation
     
     // In a storyboard-based application, you will often want to do a little preparation before navigation
     override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
     // Get the new view controller using segue.destination.
     // Pass the selected object to the new view controller.
     }
     */
    
    lazy var tableView: UITableView = {
        let tableView = UITableView(frame: CGRectZero, style: .plain)
        tableView.delegate = self
        tableView.dataSource = self
        tableView.backgroundColor = UIColor.white
//        tableView.emptyDataSetSource = self
//        tableView.emptyDataSetDelegate = self
        tableView.separatorStyle = .none
        tableView.register(AutofillItemCell.self, forCellReuseIdentifier: AutofillItemCell.description())
        tableView.register(AutofillItemEmptyCell.self, forCellReuseIdentifier: AutofillItemEmptyCell.description())
        return tableView
    }()
    
    private var emptyCell: AutofillItemEmptyCell? {
        didSet {
            emptyCell?.addButton.addTarget(self, action: #selector(toAddVault), for: .touchUpInside)
        }
    }
}

extension AutofillListController : UITableViewDelegate, UITableViewDataSource {
    func numberOfSections(in tableView: UITableView) -> Int {
        return self.vaultItems.count > 0 ? self.vaultItems.count : 1
    }
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return 1
    }
    
    func tableView(_ tableView: UITableView, heightForRowAt indexPath: IndexPath) -> CGFloat {
        return self.vaultItems.count > 0 ? 104 : 230
    }
    
    func tableView(_ tableView: UITableView, heightForHeaderInSection section: Int) -> CGFloat {
        if self.vaultItems.count > 0 {
            return CGFLOAT_MIN
        }
        
        return 136
    }
    
    func tableView(_ tableView: UITableView, viewForHeaderInSection section: Int) -> UIView? {
        return UIView()
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
        if self.vaultItems.count == 0 {
            if let cell = self.emptyCell {
                return cell
            }
            let returnCell = tableView.dequeueReusableCell(withIdentifier: AutofillItemEmptyCell.description())
            guard let returnCell = returnCell as? AutofillItemEmptyCell else {
                return UITableViewCell()
            }
            
            self.emptyCell = returnCell
            
            return returnCell
        }
        
        let cell = tableView.dequeueReusableCell(withIdentifier: AutofillItemCell.description())
    
        guard let returnCell = cell as? AutofillItemCell else { return UITableViewCell() }
        
        let item = self.vaultItems[indexPath.section]
        let datas = item.filterPasswordAndUserName()
        
        returnCell.vaultName.text = datas.vaultName
        returnCell.name.text = datas.itemName
        returnCell.username.text = datas.username
        returnCell.password.text = datas.password.count >= defaultHidePasswordString.count ? defaultHidePasswordString : (defaultHidePasswordString as NSString).substring(to: datas.password.count)
        returnCell.url.text = datas.url
        
        returnCell.loadImage(identify: datas.url, type: datas.url.starts(with: "http") ? .web : .app)

        return returnCell
    }
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)
        if let callBack = self.callBack {
            let datas = self.vaultItems[indexPath.section].filterPasswordAndUserName()
            callBack(true,[datas.username,datas.password])
        }
        self.dismiss(animated: true)
    }
}

//extension AutofillListController: DZNEmptyDataSetSource, DZNEmptyDataSetDelegate {
//    func image(forEmptyDataSet scrollView: UIScrollView!) -> UIImage! {
//        return UIImage(named: "autofill_empty_img")
//    }
//
//    func title(forEmptyDataSet scrollView: UIScrollView!) -> NSAttributedString! {
//        return NSAttributedString(string: "No information", attributes:[.font: UIFont.systemFont(ofSize: 14),.foregroundColor: UIColor(white: 1, alpha: 0.5)])
//    }
//    func buttonTitle(forEmptyDataSet scrollView: UIScrollView!, for state: UIControl.State) -> NSAttributedString! {
//        return NSAttributedString(string: "Click add", attributes:[.font: UIFont.systemFont(ofSize: 15),.foregroundColor: UIColor.blue])
//    }
//
//    func emptyDataSet(_ scrollView: UIScrollView!, didTap button: UIButton!) {
//        toAddVault()
//    }
//}
