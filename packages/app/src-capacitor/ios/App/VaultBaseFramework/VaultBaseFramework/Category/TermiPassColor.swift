//
//  BTColor.swift
//  VaultBaseFramework
//
//  Created by gjm on 2023/4/26.
//
import UIKit

extension UIColor {

    public convenience init? (hex:String, alpha:CGFloat = 1.0) {
        var cString:String = hex.trimmingCharacters(in: .whitespacesAndNewlines).uppercased()
        
        if (cString.hasPrefix("#")) {
            cString.remove(at: cString.startIndex)
        }
        
        if ((cString.count) == 6) {
            let scanner = Scanner(string: cString)
            var hexNumber: UInt64 = 0
            
            if scanner.scanHexInt64(&hexNumber) {
                
                let r, g, b: CGFloat
                
                r = CGFloat((hexNumber & 0xff0000) >> 16) / 255
                g = CGFloat((hexNumber & 0x00ff00) >> 8) / 255
                b = CGFloat((hexNumber & 0x0000ff)) / 255
                
                self.init(red: r, green: g, blue: b, alpha: alpha)
                return
            }
        }
        
        return nil
    }
    
    static public let titleColor = UIColor(hex: "#1F1814", alpha: 1)
    
    static public let subTitleColor = UIColor(hex: "#5C5551", alpha: 1) 
    
    static public let labelColor = UIColor(hex: "#b2b0af")
    
    static public let grey2Color = UIColor(hex: "#EBEBEB")
    static public let grey8Color = UIColor(hex: "#5c5c5c");
    
    
    static public let blue4Color = UIColor(hex: "#80aaff")
    

    
}
