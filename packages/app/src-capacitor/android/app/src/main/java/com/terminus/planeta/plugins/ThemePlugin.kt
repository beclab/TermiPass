package com.terminus.planeta.plugins

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.util.Log
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.tencent.mmkv.MMKV
import com.terminus.planeta.utils.Constants.isDarkThemeEnabled
import com.terminus.planeta.utils.Constants.registerStatusBar
import com.terminus.planeta.utils.RunnablePocket


@CapacitorPlugin(name = "ThemePlugin")
class ThemePlugin : Plugin() {

    private var themeChangeReceiver: BroadcastReceiver? = null

    override fun load() {
        super.load()
        themeChangeReceiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context, intent: Intent) {
                if (intent.action == Intent.ACTION_CONFIGURATION_CHANGED) {
                    registerStatusBar(bridge.activity);
                }
            }
        }
        val filter = IntentFilter(Intent.ACTION_CONFIGURATION_CHANGED)
        bridge.activity.registerReceiver(themeChangeReceiver, filter)
    }

    override fun handleOnDestroy() {
        super.handleOnDestroy()
        if (themeChangeReceiver != null){
            bridge.activity.unregisterReceiver(themeChangeReceiver)
        }
    }

    @PluginMethod
    fun get(call: PluginCall) {
        val kv = MMKV.defaultMMKV()
        val theme = kv.decodeInt("theme", 1)
        Log.i("ThemePlugin ====>", "get: $theme")
        val jsObject = JSObject().apply {
            this.put("theme", theme)
        }
        call.resolve(jsObject)
    }

    @PluginMethod
    fun set(call: PluginCall) {
        val theme = call.getInt("theme", 1)
        val kv = MMKV.defaultMMKV()
        if (theme != null){
			kv.encode("theme", theme);
		}
        RunnablePocket.post {
			registerStatusBar(getBridge().activity);
		}
	}

    @PluginMethod
    fun systemIsDark(call: PluginCall) {
        val isDark = isDarkThemeEnabled(getBridge().activity);
        val jsObject = JSObject().apply {
            this.put("dark", isDark)
        }
        call.resolve(jsObject)
    }
}
