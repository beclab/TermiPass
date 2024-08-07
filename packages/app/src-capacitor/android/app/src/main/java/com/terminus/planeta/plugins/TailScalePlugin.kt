package com.terminus.planeta.plugins

import android.app.Activity.RESULT_OK
import android.net.VpnService
import android.util.Base64
import android.util.Log
import android.widget.Toast
import androidx.activity.result.ActivityResult
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.ActivityCallback
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.plugin.CapacitorCookieManager
import com.terminus.planeta.VaultApp
import com.terminus.planeta.ipn.IPNApp
import com.terminus.planeta.utils.Constants
import org.json.JSONObject
import java.net.HttpCookie

/**
 * <pre>
 *     @author : bytetrade
 *     e-mail : zyh2433219116@gmail.com
 *     time   : 2023/07/04
 *     desc   :
 *     version: 1.0
 * </pre>
 */
@CapacitorPlugin(name = "TailScalePlugin")
class TailScalePlugin : Plugin() {

    private var cookieManager: CapacitorCookieManager? = null

    override fun load() {
        super.load()

        val statusListener: OnTailscaleStatusListener = object : OnTailscaleStatusListener {
            override fun onStatusUpdate(status: String) {
                notifyListeners("vpnStatusUpdate", JSObject().apply {
                    this.put("status", status)
                })
            }
        }
        IPNApp.instance?.setOnTailscaleStatusListener(statusListener)
    }

    @PluginMethod
    fun open(call: PluginCall) {
        val key = call.getString("authKey", "")
        val server = call.getString("server", "")
        if (!key.isNullOrEmpty()) {
            VaultApp.application?.authKey = key
        } else {
            Log.i("TailScalePlugin", " key error -> $key")
            return
        }
        if (!server.isNullOrEmpty()) {
            VaultApp.application?.scaleServer = server
        } else {
            Log.i("TailScalePlugin", " server error -> $server")
            return
        }

        val intent = VpnService.prepare(VaultApp.application)
        if (intent != null) {
            Log.i("TailScalePlugin", "startActivityForResult")
            startActivityForResult(call, intent, "handlePrepareVpn")
        } else {
            configCookie(call)
            IPNApp.instance?.ipnStart()
        }
    }

    fun configCookie(call: PluginCall) {

        val server = call.getString("server", "")
        var cookies = ""

        if (cookieManager == null) {
            cookieManager =
                CapacitorCookieManager(null, java.net.CookiePolicy.ACCEPT_ALL, this.bridge)
        }
        val cookieList = cookieManager?.getCookies(server)
        if (cookieList != null && cookieList.isNotEmpty()) {
            cookies = cookieList.map { httpCook: HttpCookie ->
                "${httpCook.name}=${httpCook.value}"
            }.joinToString(separator = ";")
        }

        Log.i("TailScalePlugin", " cookies -> $cookies")

        if (!cookies.isNullOrEmpty()) {
            VaultApp.application?.cookies = cookies
        } else {
            Log.i("TailScalePlugin", " cookies error -> $cookies")
        }
    }

    @ActivityCallback
    fun handlePrepareVpn(call: PluginCall, result: ActivityResult) {
        Log.i("TailScalePlugin", " handlePrepareVpn error -> ${result.resultCode} ${result.data}")
        if (result.resultCode == RESULT_OK) {
            configCookie(call)
            IPNApp.instance?.ipnStart()
        } else {
            Toast.makeText(this.context, "result error ${result.resultCode}", Toast.LENGTH_SHORT)
                .show()
        }
    }

    @PluginMethod
    fun close(call: PluginCall) {
        Log.i("TailScalePlugin", "close")
        IPNApp.instance?.ipnClose()
    }

    @PluginMethod
    fun status(call: PluginCall) {
        Log.i("TailScalePlugin", "status")
        val status = IPNApp.instance?.status()
        val jsObject = JSObject().apply {
            this.put("status", status)
        }
        call.resolve(jsObject)
    }

    @PluginMethod
    fun currentNodeId(call: PluginCall) {
        Log.i("TailScalePlugin", "currentNodeId")

        val jsObject = JSObject().apply {
            this.put("nodeId", "")
        }

        val currentProfile =
            IPNApp.instance?.exportEncryptedPrefsGetString("statestore-_current-profile")

        if (currentProfile.isNullOrEmpty()) {
            call.resolve(jsObject)
            return
        }

        var currentProfileStr = String(Base64.decode(currentProfile, Base64.DEFAULT))

        var prefix = "profile-"

        if (!currentProfileStr.startsWith(prefix)) {
            call.resolve(jsObject)
            return
        }

        currentProfileStr = currentProfileStr.substring(startIndex = prefix.length)

        var stateStoreProfiles =
            IPNApp.instance?.exportEncryptedPrefsGetString("statestore-_profiles")

        if (stateStoreProfiles.isNullOrEmpty()) {
            call.resolve(jsObject)
            return
        }

        var stateStoreProfilesJsonString = String(Base64.decode(stateStoreProfiles, Base64.DEFAULT))

        val jsonObject = JSONObject(stateStoreProfilesJsonString)

        val currentProfileObject = jsonObject.optJSONObject(currentProfileStr)

        if (currentProfileObject == null) {
            call.resolve(jsObject)
            return
        }
        var nodeId = currentProfileObject.optString("NodeID", "")
        if (nodeId.isNullOrEmpty()) {
            call.resolve(jsObject)
            return
        }
        jsObject.put("nodeId", nodeId)

        Log.i("TailScalePlugin", nodeId)
        call.resolve(jsObject)
    }

    @PluginMethod
    fun peersState(call: PluginCall) {
        Log.i("TailScalePlugin", "peersState")
        val status = IPNApp.instance?.status()
        val jsObject = JSObject().apply {
            this.put("isRunning", status == Constants.VPN_STATUS_RUNNING)
        }
        var state = ""
        if (status == Constants.VPN_STATUS_RUNNING) {
            IPNApp.instance?.peersState()?.let {
                state = it
            }
        }
        jsObject.put("state", state)
        call.resolve(jsObject)
    }
}
