//
//  DropboxAuthController.swift
//  App
//
//  Created by gjm on 6/18/24.
//

import UIKit
import SwiftyDropbox
import Foundation

@objc public class DropboxOauthManager: NSObject {
    
    @objc public static let standManager = DropboxOauthManager()
    
    public var authResultCallBack: ((DropboxOAuthResult?) -> Void)?
}
