//
//  ScanPhotoQR.swift
//  App
//
//  Created by gjm on 2022/12/30.
//

import Capacitor

@objc(ScanPhotoQRPlugin)
public class ScanPhotoQRPlugin: CAPPlugin {
    @objc func scan(_ call: CAPPluginCall) {
        
        let base64Content = call.getString("content") ?? ""
        if base64Content.count == 0 {
            call.resolve(["result":[]]);
            return
        }
                
        guard let image = UIImage.decodeBase64(base64String: base64Content) else {
            call.resolve(["result":[]]);
            return
        }
        
        let result = recognitionQRCode(qrCodeImage: image)

        call.resolve(["result":result ?? []]);
    }
    
    func recognitionQRCode(qrCodeImage: UIImage) -> [String]? {
        //1. 创建过滤器
        let detector = CIDetector(ofType: CIDetectorTypeQRCode, context: nil, options: nil)
        
        //2. 获取CIImage
        guard let ciImage = CIImage(image: qrCodeImage) else { return nil }
        
        //3. 识别二维码
        guard let features = detector?.features(in: ciImage) else { return nil }
        
        //4. 遍历数组, 获取信息
        var resultArr = [String]()
        for feature in features {
            if let qrCodeHeader = feature as? CIQRCodeFeature {
                if let message = qrCodeHeader.messageString {
                    resultArr.append(message)
                }
            }
        }
        
        return resultArr
    }
}


extension UIImage {
    static func decodeBase64(base64String: String) -> UIImage? {
        guard let imageData = Data(base64Encoded: base64String) else { return nil }
        return UIImage(data: imageData)
    }
    
    func decodeToBase64() -> String {
        let imageData = self.pngData()
        guard let imageBase64String = imageData?.base64EncodedString() else { return "" }
        return imageBase64String
    }
    
}
