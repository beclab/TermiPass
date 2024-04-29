//
//  SeafilePlugin.swift
//  App
//
//  Created by gjm on 8/10/23.
//

import Capacitor
import Alamofire
import VaultBaseFramework

@objc(DownloadFilePlugin)
public class DownloadFilePlugin: CAPPlugin {
    @objc func test(_ call: CAPPluginCall) {
        let value = call.getString("value") ?? ""
        call.resolve(["value": value])
    }
    
    @objc func download(_ call: CAPPluginCall) {
  
        
        let url = call.getString("url")
        
        let forceDownload = call.getBool("force") ??  false
        
        
        let downloadContent = getDestinationUrl(call);
        
        guard let destinationUrl = downloadContent, let url = url else{
            call.reject("params error")
            return
        }
        
        if isDownloaded(path: destinationUrl.path) && !forceDownload {
            call.reject("had downloaded")
            self.exportDownloadFile(destinationUrl: destinationUrl)
            return
        }
                
        let destination : DownloadRequest.Destination = { _, _ in
            return (destinationUrl,[.removePreviousFile,.createIntermediateDirectories])
        }
        
        AF.download(url, to: destination).response { response in
            print(response)
            call.resolve([
                "status": response.error == nil,
                "path": destinationUrl.path,
                "saveStatus" : FileManager.default.fileExists(atPath: destinationUrl.path)
            ])
        }
    }
    
    @objc func isDownloaded(_ call: CAPPluginCall) {

        let downloadContent = getDestinationUrl(call);
        
        guard let destinationUrl = downloadContent else{
            call.reject("params error")
            return
        }
        
        call.resolve([
            "status" : isDownloaded(path: destinationUrl.path)
        ])
    }
    
    @objc func updateDownloadSavePathByNewName(_ call: CAPPluginCall) {
        
        let downloadContent = getDestinationUrl(call);
        
        let newName = call.getString("newName")
        
        let id = call.getString("id")
        
        guard let destinationUrl = downloadContent,let newName = newName, newName.count > 0, let id = id else{
            call.reject("params error")
            return
        }
        var status = isDownloaded(path: destinationUrl.path)
        
        if !status {
            call.resolve([
                "status": false,
                "path": "",
                "saveStatus": false
            ])
            return
        }
        
        let newDestinationUrl = getDestinationUrl(name: newName, id: id)
        
        status = TermiPassBaseUtils.moveFile(from: destinationUrl.path, to: newDestinationUrl.path)
        
        
        call.resolve([
            "status":status,
            "path": newDestinationUrl.path,
            "saveStatus": FileManager.default.fileExists(atPath: newDestinationUrl.path)
        ])
    }
    
    @objc func exportDownloadFile(destinationUrl: URL) {
//        let destinationUrl = getDestinationUrl(name: name, id: id)
        
        DispatchQueue.main.async {
            let controller = UIActivityViewController(activityItems: [destinationUrl], applicationActivities: nil)
    //        (UIActivity.ActivityType?, Bool)
    //        UIActivityType __nullable activityType, BOOL completed, NSArray * __nullable returnedItems, NSError * __nullable activityError
            controller.completionWithItemsHandler = { activityType, completed, returnedItems, err in
    //            call.resolve()
            }
            
            UIApplication.shared.keyWindow?.rootViewController?.present(controller, animated: true)
        }
    }
    
    private func isDownloaded( path: String) -> Bool {
        return FileManager.default.fileExists(atPath: path)
    }
    
    private func getDestinationUrl(_ call: CAPPluginCall) -> URL? {
        let id = call.getString("id")
                
        let name = call.getString("name")
        
        guard let id = id, let name = name else {
            return nil
        }
        
        return getDestinationUrl(name: name, id: id)
    }
    
    private func getDestinationUrl(name: String, id: String) -> URL {
        return TermiPassFileGlobal.standGlobal.tempDirUrl().appendingPathComponent(id, isDirectory: true).appendingPathComponent("\(name)")
    }
}

