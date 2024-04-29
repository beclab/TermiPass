//
//  BTImage.swift
//  VaultBaseFramework
//
//  Created by gjm on 2023/4/27.
//

import Foundation
import UIKit

public class TermiPassImage {
    
    public static func createRectImage(color: UIColor, size: CGSize) -> UIImage? {
        UIGraphicsBeginImageContext(size)
        let context = UIGraphicsGetCurrentContext()
        context?.setFillColor(color.cgColor)
        context?.fill(CGRect(x: 0, y: 0, width: size.width, height: size.height))
        let image = UIGraphicsGetImageFromCurrentImageContext()
        UIGraphicsEndImageContext()
        return image
    }
    
    
//    + (UIImage*)createRectColorImageWithColor:(UIColor *)color size:(CGSize)size {
//        UIGraphicsBeginImageContext(size);
//        CGContextRef context = UIGraphicsGetCurrentContext();
//        CGContextSetFillColorWithColor(context, [color CGColor]);
//        //    CGContextAddRect(context, CGRectMake(0, 0, size.width, size.height));
//        CGContextFillRect(context, CGRectMake(0, 0, size.width, size.height));
//        UIImage *theImage = UIGraphicsGetImageFromCurrentImageContext();
//        UIGraphicsEndImageContext();
//        return theImage;
//    }
    
}
