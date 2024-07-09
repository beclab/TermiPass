package com.terminus.planeta.plugins

import com.dropbox.core.DbxRequestConfig
import com.dropbox.core.android.Auth
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin


/**
 * <pre>
 *     @author : bytetrade
 *     e-mail : zyh2433219116@gmail.com
 *     time   : 2024/06/19
 *     desc   :
 *     version: 1.0
 * </pre>
 */
@CapacitorPlugin(name = "DropboxAuthPlugin")
class DropboxPlugin : Plugin() {
    private var callId: String? = null
    private var dropboxAppConfig: DropboxAppConfig? = null

    // The scope's your app will need from Dropbox
    // Read more about Scopes here: https://developers.dropbox.com/oauth-guide#dropbox-api-permissions
    private var scopes = listOf(
        ""
//        "account_info.read",
//        "files.content.write",
//        "files.content.read",
//        "sharing.read"
    )

    override fun load() {
        super.load()
        dropboxAppConfig = DropboxAppConfig("oi7kyle19hkh6q6");
    }

    @PluginMethod
    fun initialize(call: PluginCall) {
        //Do Nothing
    }

    @PluginMethod
    fun signIn(call: PluginCall) {
        if (dropboxAppConfig != null) {
            val requestConfig = DbxRequestConfig(dropboxAppConfig?.clientIdentifier)
            Auth.startOAuth2PKCE(context, dropboxAppConfig?.apiKey, requestConfig, scopes)
            callId = call.callbackId
            this.bridge.saveCall(call)
        }
    }

    override fun handleOnResume() {
        super.handleOnResume()
        val credential = Auth.getDbxCredential()
        val uid = Auth.getUid()
        if (callId != null) {
            val call = this.bridge.getSavedCall(callId)
            if (credential != null && uid != null) {
//                Log.i("???", "accessToken: " + credential.accessToken)
//                Log.i("???", "refreshToken: " + credential.refreshToken)
//                Log.i("???", "tokenExpirationTimestamp: " + credential.expiresAt)
//                Log.i("???", "uid: " + credential.expiresAt)
                call.resolve(JSObject().apply {
                    this.put("accessToken", credential.accessToken)
                    this.put("uid", uid)
                    this.put("refreshToken", credential.refreshToken)
                    this.put("tokenExpirationTimestamp", "")
                })
            } else {
                call.reject("Authorization process failed!")
            }
        }
    }
}