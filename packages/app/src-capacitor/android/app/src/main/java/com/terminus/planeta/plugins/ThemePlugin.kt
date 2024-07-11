package com.terminus.planeta.plugins

import android.graphics.Color
import android.util.Log
import android.view.Window
import androidx.appcompat.app.AppCompatDelegate
import com.capacitorjs.plugins.statusbar.StatusBar
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

	@PluginMethod
	fun get(call: PluginCall) {
		val kv = MMKV.defaultMMKV()
		val theme = kv.decodeInt("theme", 2)
		Log.i("ThemePlugin ====>", "get: " + theme)
		val jsObject = JSObject().apply {
			this.put("theme",theme)
		}
		call.resolve(jsObject)
	}

	@PluginMethod
	fun set(call: PluginCall) {
		var theme = call.getInt("theme",1)
		val kv = MMKV.defaultMMKV()
		if (theme != null)
			kv.encode("theme", theme);
		RunnablePocket.post( {
			registerStatusBar(getBridge().activity);
		})
	}

	@PluginMethod
	fun systemIsDark(call: PluginCall) {
		val isDark = isDarkThemeEnabled(getBridge().activity);
		val jsObject = JSObject().apply {
			this.put("dark",isDark)
		}
		call.resolve(jsObject)
	}
}
