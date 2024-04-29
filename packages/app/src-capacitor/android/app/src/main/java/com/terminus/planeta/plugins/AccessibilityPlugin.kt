package com.terminus.planeta.plugins

import android.content.Intent
import android.content.IntentFilter
import android.os.Build
import androidx.localbroadcastmanager.content.LocalBroadcastManager
import com.terminus.planeta.accessibility.AccessibilityHelper.tempCredential
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.PluginMethod
import com.getcapacitor.PluginCall
import com.terminus.planeta.accessibility.AppCredential
import com.terminus.planeta.accessibility.AccessibilityUtils
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.terminus.planeta.utils.Constants

/**
 * <pre>
 * @author : bytetrade
 * e-mail : zyh2433219116@gmail.com
 * time   : 2023/02/07
 * desc   :
 * version: 1.0
</pre> *
 */
@CapacitorPlugin(name = "AccessibilityPlugin")
class AccessibilityPlugin : Plugin() {

    private val TAG: String = AutofillFrameworkPlugin::class.java.simpleName
    private lateinit var receiver: IntentReceiver

    override fun load() {
        receiver = IntentReceiver(Constants.ACTION_AUTOFILL_ACCESSIBILITY,
            object : OnSendIntentDataListener {
                override fun onSendData(json: JSObject) {
                    notifyListeners("onAutofillAccessibility", json, true)
                }

            },
            object : OnHandleIntentListener {
                override fun onHandleIntent(intent: Intent): JSObject {
                    return JSObject().apply {
                        put(
                            Constants.AUTOFILL_EXTRA_URI,
                            intent.getStringExtra(Constants.AUTOFILL_EXTRA_URI)
                        )
                    }
                }

            })
        LocalBroadcastManager.getInstance(context).registerReceiver(receiver, IntentFilter(Constants.ACTION_AUTOFILL_ACCESSIBILITY))
    }

    override fun handleOnDestroy() {
        receiver.let {
            LocalBroadcastManager.getInstance(context).unregisterReceiver(receiver)
        }
        super.handleOnDestroy()
    }

    @PluginMethod
    fun openAccessibilitySettingPage(call: PluginCall) {
        AccessibilityUtils.openAccessibilitySettingPage(context)
    }

    @PluginMethod
    fun openOverlaySettingPage(call: PluginCall) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            AccessibilityUtils.openOverlaySettingPage(context)
        }
        call.resolve()
    }

    @PluginMethod
    fun isAccessibilityEnable(call: PluginCall) {
        val isEnable = AccessibilityUtils.isAccessibilityServiceRunning()
        val jsObject = JSObject()
        jsObject.put("isEnable", isEnable)
        call.resolve(jsObject)
    }

    @PluginMethod
    fun isOverlayEnable(call: PluginCall) {
        val isEnable = AccessibilityUtils.isOverlayEnable(context)
        val jsObject = JSObject()
        jsObject.put("isEnable", isEnable)
        call.resolve(jsObject)
    }

    @PluginMethod
    fun setResult(call: PluginCall) {
        val uri = call.getString("uri")
        val userName = call.getString("userName")
        val password = call.getString("password")
        val credential = AppCredential(uri, userName, password)
        tempCredential = credential
        call.resolve()
    }
}