//
//  BiometricTool.swift
//  autofill
//
//  Created by gjm on 2023/2/8.
//

import Foundation
import LocalAuthentication
open class BiometricTool {
    
    public struct Credentials {
        public var username: String
        public var password: String
    }
    
    public struct BiometricInfo {
        public var isAvailable: Bool
        public var biometricType: LABiometryType
        public var errorCode: Int
    }
    
    public enum KeychainError: Swift.Error {
        case noPassword
        case unexpectedPasswordData
        case duplicateItem
        case unhandledError(status: OSStatus)
    }
    
    
    @objc public static func verifyIdentity( callBack:@escaping (_ status: Bool, _ message: String, _ callBackdata: Data?) -> Void){
        let context = LAContext()
        var canEvaluateError: NSError?

        let policy = LAPolicy.deviceOwnerAuthenticationWithBiometrics
        
        if context.canEvaluatePolicy(policy, error: &canEvaluateError){
            let data = context.evaluatedPolicyDomainState
            let reason = "For biometric authentication"
            
            context.evaluatePolicy(policy, localizedReason: reason) { (success, evaluateError) in
                
                if success {
//                    call.resolve()
                    callBack(true,"",data)
                } else{
                    var errorCode = "0"
                    
                    guard let error = evaluateError
                    else {
                        return
                    }
                    
                    switch error._code {
                        
                    case LAError.authenticationFailed.rawValue:
                        errorCode = "10"
                        
                    case LAError.appCancel.rawValue:
                        errorCode = "11"
                        
                    case LAError.invalidContext.rawValue:
                        errorCode = "12"
                        
                    case LAError.notInteractive.rawValue:
                        errorCode = "13"
                        
                    case LAError.passcodeNotSet.rawValue:
                        errorCode = "14"
                        
                    case LAError.systemCancel.rawValue:
                        errorCode = "15"
                        
                    case LAError.userCancel.rawValue:
                        errorCode = "16"
                        
                    case LAError.userFallback.rawValue:
                        errorCode = "17"
                        
                    case LAError.biometryNotAvailable.rawValue:
                        errorCode = "1"
                        
                    case LAError.biometryLockout.rawValue:
                        errorCode = "2" //"Authentication could not continue because the user has been locked out of biometric authentication, due to failing authentication too many times."
                        
                    case LAError.biometryNotEnrolled.rawValue:
                        errorCode = "3" //message = "Authentication could not start because the user has not enrolled in biometric authentication."
                        
                    default:
                        errorCode = "0" // Biometrics unavailable
                    }
//                    print(errorCode)
                    callBack(false,errorCode, nil)
                }
                
            }
    
        }
    }
    
    static public func getCredentialsFromKeychain(_ server: String) throws -> Credentials {
        let query: [String: Any] = [kSecClass as String: kSecClassInternetPassword,
                                    kSecAttrServer as String: server,
                                    kSecMatchLimit as String: kSecMatchLimitOne,
                                    kSecReturnAttributes as String: true,
                                    kSecReturnData as String: true]
        
        var item: CFTypeRef?
        let status = SecItemCopyMatching(query as CFDictionary, &item)
        guard status != errSecItemNotFound else { throw KeychainError.noPassword }
        guard status == errSecSuccess else { throw KeychainError.unhandledError(status: status) }
        
        
        
        guard let existingItem = item as? [String: Any],
              let passwordData = existingItem[kSecValueData as String] as? Data,
              let password = String(data: passwordData, encoding: .utf8),
              let username = existingItem[kSecAttrAccount as String] as? String
        else {
            throw KeychainError.unexpectedPasswordData
        }
        
        let credentials = Credentials(username: username, password: password)
        return credentials
    }
    
    @objc public static func setCredentials(server: String?, username: String?, password: String? ) throws {
        
        guard let server = server,let username = username,let password = password else { return }
        
        let credentials = Credentials(username: username, password: password)
        
        do{
            try storeCredentialsInKeychain(credentials, server)
        } catch KeychainError.duplicateItem {
            try updateCredentialsInKeychain(credentials, server)
        } catch {
          throw error
        }
    }
    
    static func storeCredentialsInKeychain(_ credentials: Credentials, _ server: String) throws {
        let query: [String: Any] = [kSecClass as String: kSecClassInternetPassword,
                                    kSecAttrAccount as String: credentials.username,
                                    kSecAttrServer as String: server,
                                    kSecValueData as String: credentials.password.data(using: .utf8)!]
        
        let status = SecItemAdd(query as CFDictionary, nil)
        
        guard status != errSecDuplicateItem else { throw KeychainError.duplicateItem }
        guard status == errSecSuccess else { throw KeychainError.unhandledError(status: status) }
    }
    
    static func updateCredentialsInKeychain(_ credentials: Credentials, _ server: String) throws{
        let query: [String: Any] = [kSecClass as String: kSecClassInternetPassword,
                                    kSecAttrServer as String: server]
        
        let account = credentials.username
        let password = credentials.password.data(using: String.Encoding.utf8)!
        let attributes: [String: Any] = [kSecAttrAccount as String: account,
                                         kSecValueData as String: password]
        
        let status = SecItemUpdate(query as CFDictionary, attributes as CFDictionary)
        guard status != errSecItemNotFound else { throw KeychainError.noPassword }
        guard status == errSecSuccess else { throw KeychainError.unhandledError(status: status) }
    }
    
    
    // Delete user Credentials from Keychain
   @objc  public static func deleteCredentialsFromKeychain(_ server: String)throws{
        let query: [String: Any] = [kSecClass as String: kSecClassInternetPassword,
                                    kSecAttrServer as String: server]
        
        let status = SecItemDelete(query as CFDictionary)
        guard status == errSecSuccess || status == errSecItemNotFound else { throw KeychainError.unhandledError(status: status) }
    }
    
    
    public static func isAvailable() -> BiometricInfo {
        let context = LAContext()
        var error: NSError?
        
        var biometricInfo = BiometricInfo(isAvailable: false, biometricType: .none, errorCode: 0)

        let policy = LAPolicy.deviceOwnerAuthenticationWithBiometrics
        
        if context.canEvaluatePolicy(policy, error: &error){
            biometricInfo.biometricType = context.biometryType
            biometricInfo.isAvailable = true
        } else {
            guard let authError = error else {
                return biometricInfo
            }
            var errorCode = 0
            switch authError.code {
                case LAError.biometryNotAvailable.rawValue:
                    errorCode = 1
                    
                case LAError.biometryLockout.rawValue:
                    errorCode = 2 //"Authentication could not continue because the user has been locked out of biometric authentication, due to failing authentication too many times."
                    
                case LAError.biometryNotEnrolled.rawValue:
                    errorCode = 3//message = "Authentication could not start because the user has not enrolled in biometric authentication."
                    
                default:
                    errorCode = 0 //"Did not find error code on LAError object"
            }
            biometricInfo.errorCode = errorCode
        }
             
        return biometricInfo
    }
}
