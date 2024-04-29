//
//  BackWhiteBarButtonItem.swift
//  VaultBaseFramework
//
//  Created by gjm on 2023/4/27.
//

import UIKit

open class TermiPassBaseBarButtonItem {
    public static func createBackButton(target: Any, action: Selector?) -> UIBarButtonItem {
        let barButtonItem = UIBarButtonItem(image: UIImage(named: "base_back_white_image"), style: .plain, target: self, action: action)
        barButtonItem.tintColor = UIColor.black
        return barButtonItem
    }
    
    public static func controllerAddBackButton(vc: UIViewController, action: Selector?) {
        vc.navigationItem.leftBarButtonItem = self.createBackButton(target: vc, action: action)
    }
    
}
