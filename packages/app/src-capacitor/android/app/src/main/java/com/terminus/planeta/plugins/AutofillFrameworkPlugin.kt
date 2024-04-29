package com.terminus.planeta.plugins

import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.PluginMethod
import com.getcapacitor.PluginCall
import com.terminus.planeta.autofill.AutofillAppCredential
import android.app.assist.AssistStructure
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Build
import android.util.Log
import android.view.autofill.AutofillManager
import androidx.localbroadcastmanager.content.LocalBroadcastManager
import com.terminus.planeta.autofill.AutofillUtils
import com.terminus.planeta.autofill.DataSetAdapter.setDateSetResult
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.terminus.planeta.utils.Constants

/**
 * <pre>
 * @author : bytetrade
 * e-mail : zyh2433219116@gmail.com
 * time   : 2023/02/14
 * desc   :
 * version: 1.0
</pre> *
 */
@CapacitorPlugin(name = "AutofillFrameworkPlugin")
class AutofillFrameworkPlugin : Plugin() {

    private val TAG: String = AutofillFrameworkPlugin::class.java.simpleName
    private lateinit var receiver: FrameworkIntentReceiver

    override fun load() {
        Log.d(TAG, "load")
        val filter = IntentFilter().apply {
            addAction(Constants.ACTION_AUTOFILL_FRAMEWORK)
            addAction(Constants.ACTION_AUTOFILL_FRAMEWORK_SAVE)
        }
        receiver = FrameworkIntentReceiver(object : OnFrameworkSendDataListener {
            override fun onAutoFill(json: JSObject) {
                Log.d(TAG, "onAutoFill: $json")
                notifyListeners("onAutofillFramework", json, true)
            }

            override fun onSaveData(json: JSObject) {
                notifyListeners("onAutofillFrameworkSave", json, true)
            }

        })
        LocalBroadcastManager.getInstance(context).registerReceiver(receiver,filter)
    }

    interface OnFrameworkSendDataListener {
        fun onAutoFill(json: JSObject)
        fun onSaveData(json: JSObject)
    }

    class FrameworkIntentReceiver(sendListener: OnFrameworkSendDataListener) :
        BroadcastReceiver() {

        private var sendIntentListener: OnFrameworkSendDataListener = sendListener

        override fun onReceive(context: Context?, intent: Intent?) {
            Log.d("AutofillFrameworkPlugin", "onReceive: " + intent?.action)

            intent?.let {
                if (Constants.ACTION_AUTOFILL_FRAMEWORK == it.action) {
                    val json = JSObject().apply {
                        put(
                            Constants.AUTOFILL_EXTRA_URI,
                            intent.getStringExtra(Constants.AUTOFILL_EXTRA_URI)
                        )
                    }
                    Log.d("AutofillFrameworkPlugin", "handle intent: $json")
                    sendIntentListener.onAutoFill(json)
                } else if (Constants.ACTION_AUTOFILL_FRAMEWORK_SAVE == it.action) {
                    val json = JSObject().apply {
                        put(
                            Constants.AUTOFILL_EXTRA_URI,
                            intent.getStringExtra(Constants.AUTOFILL_EXTRA_URI)
                        )
                        put(
                            Constants.FRAMEWORK_SAVE_TYPE,
                            intent.getStringExtra(Constants.FRAMEWORK_SAVE_TYPE)
                        )
                        put(
                            Constants.FRAMEWORK_SAVE_DATA,
                            intent.getStringExtra(Constants.FRAMEWORK_SAVE_DATA)
                        )
                    }
                    sendIntentListener.onSaveData(json);
                }
            }
        }
    }

    override fun handleOnDestroy() {
        receiver.let {
            LocalBroadcastManager.getInstance(context).unregisterReceiver(receiver)
        }
        super.handleOnDestroy()
    }

    @PluginMethod
    fun openSettingPage(call: PluginCall) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            AutofillUtils.openAutofillSettingPage(activity)
            call.resolve()
            return
        }
        call.reject("version error")
    }

    @PluginMethod
    fun isSupport(call: PluginCall) {
        val isSupport = AutofillUtils.isSupportAutoFillService(context)
        val jsObject = JSObject()
        jsObject.put("isSupport", isSupport)
        call.resolve(jsObject)
    }

    @PluginMethod
    fun isEnable(call: PluginCall) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val isEnable = AutofillUtils.hasEnableAutoFillService(activity)
            val jsObject = JSObject()
            jsObject.put("isEnable", isEnable)
            call.resolve(jsObject)
            return
        }
        call.reject("version error")
    }

    @PluginMethod
    fun closeService(call: PluginCall) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            AutofillUtils.disableAutofillService(context)
            call.resolve()
            return
        }
        call.reject("version error")
    }

    @PluginMethod
    fun setResult(call: PluginCall) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val uri = call.getString("uri")
            val userName = call.getString("userName")
            val password = call.getString("password")
            val credential = AutofillAppCredential(uri, userName, password)
            val intent = bridge.activity.intent
            if (intent == null) {
                call.reject("no intent")
                return
            }
            val structure =
                intent.getParcelableExtra<AssistStructure>(AutofillManager.EXTRA_ASSIST_STRUCTURE)
            setDateSetResult(structure!!, credential, bridge.activity)
            call.resolve()
        }
    }
}