//
//  HookHttpRequestHandler.swift
//  App
//
//  Created by gjm on 6/14/23.
//

import Capacitor
import VaultBaseFramework

class HookHttpRequestHandler: HttpRequestHandler {
    
    public static func newBuildResponse(_ data: Data?, _ response: HTTPURLResponse, responseType: ResponseType = .default) -> [String: Any] {
        
        var output = [:] as [String: Any]
        
        output["status"] = response.statusCode
        output["headers"] = response.allHeaderFields
        output["url"] = response.url?.absoluteString
        
        guard let data = data else {
            output["data"] = ""
            return output
        }
        
        let contentType = (response.allHeaderFields["Content-Type"] as? String ?? "application/default").lowercased()
        if responseType == .arrayBuffer || responseType == .blob {
            output["data"] = data.base64EncodedString()
        } else if responseType == .document || responseType == .text || responseType == .default {
            output["data"] = String(data: data, encoding: .utf8)
        } else if contentType.contains("application/json") || responseType == .json {
            output["data"] = newTryParseJson(data)
        }
        
        print("--------------------------------------------------------------------------------\n")
        print("******Request Url******")
        print("\(String(describing: output["url"]))")
        print("******Response Data******")
        print("\(String(describing: output["data"]))")
        print("--------------------------------------------------------------------------------\n")
        
        return output
    }
    
    public static func newRequest(_ call: CAPPluginCall, _ httpMethod: String?, _ config: InstanceConfiguration?) throws {
        guard var urlString = call.getString("url") else { throw URLError(.badURL) }
        let method = httpMethod ?? call.getString("method", "GET")
        
        var headers = (call.getObject("headers") ?? [:]) as [String: Any]
        var params = (call.getObject("params") ?? [:]) as [String: Any]
        let responseType = call.getString("responseType") ?? "json"
        let connectTimeout = call.getDouble("connectTimeout")
        let readTimeout = call.getDouble("readTimeout")
//        let dataType = call.getString("dataType") ?? "any"
        
//        var hideCookie = false
        if (params["hideCookie"] != nil) {
//            hideCookie = true
            params.removeValue(forKey: "hideCookie")
            headers["Cookie"] = ""
        }
        
        
        var reallyContentType = ""
        if (params["reallyContentType"] != nil) {
            reallyContentType = params["reallyContentType"] as? String ?? ""
            headers["Content-Type"] = reallyContentType
            params.removeValue(forKey: "reallyContentType")
        }
        
//        var isFormData = false
        
        print("urlString===>:\(urlString)")
        print("params===>:\(params)")
        print("headers ===>:\(headers)")
        
        
        if urlString == urlString.removingPercentEncoding {
            guard let encodedUrlString = urlString.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed)  else { throw URLError(.badURL) }
            urlString = encodedUrlString
        }
        
        let request = try CapacitorHttpRequestBuilder()
            .setUrl(urlString)
            .setMethod(method)
            .setUrlParams(params)
            .openConnection()
            .build()
        
        if reallyContentType.count > 0 {
            request.headers["Content-Type"] = reallyContentType
        }
        request.setRequestHeaders(headers)
        
        // Timeouts in iOS are in seconds. So read the value in millis and divide by 1000
        let timeout = (connectTimeout ?? readTimeout ?? 600000.0) / 1000.0
        request.setTimeout(timeout)

        if let data = call.options["data"] as? JSValue {
            print("data ===> \(data)")
            do {
                if (reallyContentType == "multipart/form-data") {
                    try getRequestDataAsMultipartFormData(request: request, data)
                } else {
                    try request.setRequestBody(data)
                }
                print("body ===>\(String(describing: request.request.httpBody))")
            } catch {
                // Explicitly reject if the http request body was not set successfully,
                // so as to not send a known malformed request, and to provide the developer with additional context.
                call.reject(error.localizedDescription, (error as NSError).domain, error, nil)
                return
            }
        }
        
        let urlRequest = request.getUrlRequest()
        let urlSession = request.getUrlSession(call)
               
        let task = urlSession.dataTask(with: urlRequest) { (data, response, error) in
            urlSession.invalidateAndCancel()
            
            if let error = error {
                call.reject(error.localizedDescription, (error as NSError).domain, error, nil)
                return
            }
            
            if ( response as! HTTPURLResponse).statusCode == 200 || ( response as! HTTPURLResponse).statusCode == 201 {
                setCookiesFromResponse(response as! HTTPURLResponse, config)
            }
            
            TermiPassCookieShareManager.standManager.syncFromSharedCookie()
            
            let type = ResponseType(rawValue: responseType) ?? .default
            call.resolve(self.newBuildResponse(data, response as! HTTPURLResponse, responseType: type))
        }
        
        task.resume()
    }
    
    public static func getRequestDataAsMultipartFormData(request: CapacitorUrlRequest, _ data: JSValue) throws {
        guard let obj = data as? JSObject else {
            throw  CapacitorUrlRequest.CapacitorUrlRequestError.serializationError("[ data ] argument for request with content-type [ application/x-www-form-urlencoded ] may only be a plain javascript object")
        }

        let strings: [String: String] = obj.compactMapValues { any in
            any as? String
        }

        var data = Data()
        let boundary = UUID().uuidString
        let contentType = "multipart/form-data; boundary=\(boundary)"
        request.request.setValue(contentType, forHTTPHeaderField: "Content-Type")
        request.headers["Content-Type"] = contentType

        strings.forEach { key, value in
            data.append("--\(boundary)\r\n".data(using: .utf8)!)
            data.append("Content-Disposition: form-data; name=\"\(key)\"\r\n\r\n".data(using: .utf8)!)
            data.append("\(value)\r\n".data(using: .utf8)!)
        }
        data.append("--\(boundary)--\r\n".data(using: .utf8)!)

//        return data
        request.request.httpBody = data
    }

}

func newTryParseJson(_ data: Data) -> Any {
    do {
        return try JSONSerialization.jsonObject(with: data, options: [.mutableContainers, .fragmentsAllowed])
    } catch {
        return error.localizedDescription
    }
}

extension Data: JSValue {}
