//
//  TermiPassBaseUtils.swift
//  VaultBaseFramework
//
//  Created by gjm on 8/10/23.
//

import Foundation

@objc public class TermiPassBaseUtils: NSObject {
    
    
     @objc static public func checkMakeDir(path: String) -> Bool {
        var isDir : ObjCBool = false
        if FileManager.default.fileExists(atPath: path, isDirectory: &isDir) || !isDir.boolValue {
            do {
                if !isDir.boolValue {
                    try FileManager.default.removeItem(atPath: path)
                }
                try FileManager.default.createDirectory(atPath: path, withIntermediateDirectories: true)
            } catch {
                print(error)
                
                return false
            }
        }
        return true
    }
 
    
    @objc static public func clearAllFiles(path: String){

        do {
            let dirContents = try FileManager.default.contentsOfDirectory(atPath: path)
            
            for content in dirContents {
                let contentPath = path + "/\(content)"
                try FileManager.default.removeItem(atPath: contentPath)
            }
            
        } catch  {
            
        }
        
    }
    
    static func removeFile(path: String) -> Bool{
        if !FileManager.default.fileExists(atPath: path) {
            return false
        }
        do {
            try FileManager.default.removeItem(atPath: path)
        } catch  {
            
        }
        return true
    }
    
    public static func moveFile(from: String, to: String) -> Bool  {
        if FileManager.default.fileExists(atPath: to) || !FileManager.default.fileExists(atPath: from) {
            return false
        }
        
        do {
            try FileManager.default.moveItem(atPath: from, toPath: to)
        } catch {
            return false
        }
        
        return true
    }
    
}
