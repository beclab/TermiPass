//
//  HandJsonUtil.swift
//  App
//
//  Created by gjm on 2023/2/13.
//

import Foundation
import HandyJSON

public class HandjsonUtil {
    static func toJsonData(object: HandyJSON) throws -> Data {
        guard let jsonString = object.toJSON() else {
            
            throw Error.paramsError
        }
        guard let data = try? JSONSerialization.data(withJSONObject: jsonString, options: [.prettyPrinted]) else {
            throw Error.paramsError
        }
        return data
    }
    
    static func jsonDataToModel(data: Data) throws -> Any {
        guard let str = try? JSONSerialization.jsonObject(with: data,options: [.mutableContainers]) else {
            throw Error.paramsError
        }
       return str
    }
}


