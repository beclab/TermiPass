//
//  TermiPassGroupCookieShareManager.swift
//  VaultBaseFramework
//
//  Created by gjm on 11/28/23.
//

import Foundation

//NSArray* httpCookies = [NSHTTPCookieStorage sharedHTTPCookieStorage].cookies;
//
//NSString *groupID = @"group.com.test.demo";
//
//// 为测试方便，清空一下历史的共享 cookies
//NSDate *date = [NSDate dateWithTimeIntervalSince1970:NSTimeIntervalSince1970];
//[[NSHTTPCookieStorage sharedCookieStorageForGroupContainerIdentifier:groupID] removeCookiesSinceDate:date];
//
//for(NSHTTPCookie* cookie in httpCookies) {
//    //group identifier is important and it should be created in the apple developer portal
//    [[NSHTTPCookieStorage sharedCookieStorageForGroupContainerIdentifier:groupID] setCookie:cookie];
//}
//
//
//NSArray *cookies = [NSHTTPCookieStorage sharedCookieStorageForGroupContainerIdentifier:groupID].cookies;
//NSLog(@"cookies = %@", cookies);


@objc public class TermiPassCookieShareManager: NSObject {
    
    @objc public static let standManager = TermiPassCookieShareManager()
    
    
    public func syncFromSharedCookie() {
        let httpCookies = HTTPCookieStorage.shared.cookies
        
        guard let httpCookies = httpCookies else {
            return
        }
        
        let date = Date(timeIntervalSince1970: NSTimeIntervalSince1970)
        
        HTTPCookieStorage.sharedCookieStorage(forGroupContainerIdentifier: fileGroupSuiName).removeCookies(since: date);
        
        for cookie in httpCookies {
            HTTPCookieStorage.sharedCookieStorage(forGroupContainerIdentifier: fileGroupSuiName).setCookie(cookie)
        }
    }
    
    public func syncToSharedCookie() {
        
        let httpCookies =  HTTPCookieStorage.sharedCookieStorage(forGroupContainerIdentifier: fileGroupSuiName).cookies
        
        guard let httpCookies = httpCookies else {
            return
        }
        
        let date = Date(timeIntervalSince1970: NSTimeIntervalSince1970)
        
        HTTPCookieStorage.shared.removeCookies(since: date);
        
        for cookie in httpCookies {
            HTTPCookieStorage.shared.setCookie(cookie)
        }
        
        let cookies =  HTTPCookieStorage.shared.cookies
        
        print(cookies ?? [])
    }
}
