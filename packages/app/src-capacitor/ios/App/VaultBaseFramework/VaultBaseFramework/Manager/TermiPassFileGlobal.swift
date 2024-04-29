//
//  TermiPassFileGlobal.swift
//  VaultBaseFramework
//
//  Created by gjm on 8/10/23.
//

import Foundation

@objc public class TermiPassFileGlobal: NSObject {
    
    @objc public static let standGlobal = TermiPassFileGlobal()
    
    private var cacheRootPath = ""
    
    private var cacheUserDefaults = TermiPassBaseGlobal.standGlobal.fileUserDefault
    
    public func register(rootPath: String) {
        cacheRootPath = rootPath
        
        _ = TermiPassBaseUtils.checkMakeDir(path: objectsDir())
        _ = TermiPassBaseUtils.checkMakeDir(path: tempDir())
    }
    
    public func rootPath() -> String {
        return self.cacheRootPath
    }
    
    
    public func objectsDir() -> String {
        return rootPath() + "/objects"
    }
    
    public func tempDir() -> String {
        return rootPath() + "/temp"
    }
    
    public func tempDirUrl() -> URL {
        return URL(fileURLWithPath: self.tempDir())
    }
    
    
    public func loadAccounts() {
        
    }
}
