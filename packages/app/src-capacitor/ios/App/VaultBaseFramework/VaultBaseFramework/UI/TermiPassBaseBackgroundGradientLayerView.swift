//
//  BackgroundGradientLayerView.swift
//  VaultBaseFramework
//
//  Created by gjm on 2023/4/26.
//

import UIKit

public class TermiPassBaseBackgroundGradientLayerView {
    
    public static func createBG(size: CGSize) -> CAGradientLayer {
        let topColor = UIColor.red//UIColor.init(white: 1, alpha: 0.12)
        let buttomColor = UIColor.red//UIColor.init(white: 1, alpha: 0)
        let gradientColors = [topColor.cgColor, buttomColor.cgColor]
        
        let gradientLayer = CAGradientLayer()
        gradientLayer.colors = gradientColors
        //        gradientLayer.locations = gradientLocations
        gradientLayer.startPoint = CGPoint(x: 0,y: 0)
        gradientLayer.endPoint = CGPoint(x: 1,y: 1)
        
        //设置其CAGradientLayer对象的frame，并插入view的layer
        gradientLayer.frame = CGRect(x: 0, y: 0, width: size.width, height: size.height)
        return gradientLayer
    }
    
    public static func commonBorder(view: UIView) {
        view.layer.borderWidth = 0.5
        view.layer.borderColor = UIColor.grey2Color?.cgColor;
        view.layer.cornerRadius = 8
        view.layer.masksToBounds = true
    }
    
    public static func errorBorder(view: UIView) {
        view.layer.borderWidth = 0.5
        view.layer.borderColor = UIColor(hex: "#ff5935")?.cgColor
        view.layer.cornerRadius = 8
        view.layer.masksToBounds = true
    }
    
    public static func editingBorder(view: UIView) {
        view.layer.borderWidth = 0.5
        view.layer.borderColor = UIColor.white.cgColor
        view.layer.cornerRadius = 8
        view.layer.masksToBounds = true
    }
}
