package com.terminus.planeta.plugins

import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.PluginMethod
import com.getcapacitor.PluginCall
import com.terminus.planeta.autofill.AutofillAppCredential
import android.app.assist.AssistStructure
import android.content.Intent
import android.os.Build
import android.util.Log
import android.view.autofill.AutofillManager
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

    override fun handleOnNewIntent(intent: Intent?) {
        super.handleOnNewIntent(intent)
        intent?.let {
            if (Constants.ACTION_AUTOFILL_FRAMEWORK == it.action) {
                val json = JSObject().apply {
                    put(
                        Constants.AUTOFILL_EXTRA_URI,
                        intent.getStringExtra(Constants.AUTOFILL_EXTRA_URI)
                    )
                }
                Log.d("AutofillFrameworkPlugin", "handle intent: $json")
                notifyListeners("onAutofillFramework", json, true)
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
                notifyListeners("onAutofillFrameworkSave", json, true)
            }
        }
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