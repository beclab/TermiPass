//
//  VBaseNavigationController.swift
//  App
//
//  Created by gjm on 2023/1/6.
//

import UIKit

open class TermiPassBaseNavigationController: UINavigationController {
    
    open override func viewDidLoad() {
        super.viewDidLoad()
        
        
        self.navigationBar.isTranslucent = false
        //        self.navigationBar.barTintColor = UIColor.white
        
        if #available(iOS 15.0, *) {
            let navigationBarAppearance = UINavigationBarAppearance()
            //            navigationBarAppearance.configureWithDefaultBackground()
            navigationBarAppearance.backgroundColor = UIColor.white//UIColor(red: 13.0/255, green: 13.0/255, blue: 13.0/255, alpha: 1)
            
            navigationBarAppearance.backgroundEffect = nil
            navigationBarAppearance.titleTextAttributes = [ NSAttributedString.Key.foregroundColor: UIColor.white]
            
            
            UINavigationBar.appearance().standardAppearance = navigationBarAppearance
            UINavigationBar.appearance().compactAppearance = navigationBarAppearance
            UINavigationBar.appearance().scrollEdgeAppearance = navigationBarAppearance
            
            
            //            [self.navigationController.navigationBar setTitleTextAttributes:@{NSFontAttributeName:[UIFont systemFontOfSize:16],  NSForegroundColorAttributeName:[UIColor whiteColor]}];
        } else {
            navigationBar.barTintColor = UIColor.white//UIColor(red: 13.0/255, green: 13.0/255, blue: 13.0/255, alpha: 1)
            self.navigationBar.titleTextAttributes = [
                NSAttributedString.Key.foregroundColor : UIColor.titleColor ?? UIColor.black
            ]
        }
        
    }
}
