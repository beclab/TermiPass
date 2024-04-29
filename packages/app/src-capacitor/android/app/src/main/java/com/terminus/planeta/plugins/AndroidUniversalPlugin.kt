package com.terminus.planeta.plugins

import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.graphics.drawable.BitmapDrawable
import android.util.Log
import com.getcapacitor.*
import com.getcapacitor.annotation.CapacitorPlugin
import com.terminus.planeta.utils.Constants
import com.terminus.planeta.utils.Utils

/**
 * <pre>
 *     @author : bytetrade
 *     e-mail : zyh2433219116@gmail.com
 *     time   : 2023/02/15
 *     desc   :
 *     version: 1.0
 * </pre>
 */
@CapacitorPlugin(name = "AndroidUniversalPlugin")
class AndroidUniversalPlugin : Plugin() {

    private val TAG: String = AndroidUniversalPlugin::class.java.simpleName
    private lateinit var receiver: IntentReceiver

    override fun load() {
        receiver = IntentReceiver(Constants.ACTION_HANDLE_INTENT,
            object : OnSendIntentDataListener {
                override fun onSendData(json: JSObject) {
                    notifyListeners("onIntent", json,true)
                }

            },
            object : OnHandleIntentListener {
                override fun onHandleIntent(intent: Intent): JSObject {
                    return JSObject().apply {
                        put("type", intent.getStringExtra("type"))
                        put("message", intent.getStringExtra("message"))
                    }
                }

            })
        context.registerReceiver(receiver, IntentFilter(Constants.ACTION_HANDLE_INTENT))
    }

    override fun handleOnDestroy() {
        receiver.let {
            context.unregisterReceiver(it)
        }
        super.handleOnDestroy()
    }

    @PluginMethod
    fun finish(call: PluginCall) {
        bridge.activity.finish()
        call.resolve()
    }

    @PluginMethod
    fun moveTaskToBack(call: PluginCall) {
        bridge.activity.moveTaskToBack(true)
        call.resolve()
    }

    @PluginMethod
    fun getAppIconByPackageName(call: PluginCall) {
        val packageName = call.getString("packageName")
        if (packageName.isNullOrEmpty()) {
            call.reject("packageName is empty")
            return
        }
        Log.i(TAG, "getAppIconByPackageName: $packageName")
        val pm = bridge.activity.packageManager
        try {
            val appInfo = pm.getApplicationInfo(packageName, PackageManager.GET_META_DATA);
            val drawable = pm.getApplicationIcon(appInfo)
            val bitmap = (drawable as BitmapDrawable).bitmap
            val base64 = Utils.bitmapToBase64(bitmap)
            val sendObject = JSObject()
            sendObject.put("base64", base64)
            call.resolve(sendObject)
        } catch (e: Exception) {
            Log.i(TAG, "getAppIconByPackageName catch: ${e.message}")
            call.reject(e.message)
        }
    }
}