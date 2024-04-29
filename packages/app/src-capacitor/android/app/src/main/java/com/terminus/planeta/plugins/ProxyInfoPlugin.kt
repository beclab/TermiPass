package com.terminus.planeta.plugins

import android.net.Uri
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
 *     time   : 2023/08/10
 *     desc   :
 *     version: 1.0
 * </pre>
 */
@CapacitorPlugin(name = "ProxyInfoPlugin")
class ProxyInfoPlugin : Plugin(){

    @PluginMethod
    fun getServerInfo(call: PluginCall) {
        val jsObject = JSObject()
        val serverUrl = bridge.config.serverUrl
        val url = Uri.parse(serverUrl);
        jsObject.put("serverUrl",serverUrl)
        jsObject.put("scheme",url.scheme)
        jsObject.put("host", url.host)
        jsObject.put("port", url.port)
        call.resolve(jsObject)
    }

}