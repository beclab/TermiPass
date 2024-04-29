package com.terminus.planeta.plugins

import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.terminus.planeta.utils.Utils

/**
 * <pre>
 *     @author : bytetrade
 *     e-mail : zyh2433219116@gmail.com
 *     time   : 2023/04/19
 *     desc   :
 *     version: 1.0
 * </pre>
 */
@CapacitorPlugin(name = "AppNativeInfo")
class AppNativeInfoPlugin : Plugin() {

    @PluginMethod
    fun getInfo(call: PluginCall){
        val jsObject = JSObject()
        jsObject.put("appVersionName", Utils.getVersionName(context))
        jsObject.put("appVersionCode", Utils.getVersionCode(context))
        call.resolve(jsObject)
    }
}