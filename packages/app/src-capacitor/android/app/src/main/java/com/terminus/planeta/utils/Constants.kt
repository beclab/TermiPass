package com.terminus.planeta.utils

import android.content.Context
import android.content.Intent
import android.content.res.Configuration
import android.graphics.Color
import android.util.Log
import android.view.Window
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.app.AppCompatDelegate
import com.capacitorjs.plugins.statusbar.StatusBar
import com.tencent.mmkv.MMKV
import com.terminus.planeta.BuildConfig.APPLICATION_ID
import com.terminus.planeta.MainActivity
import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject

/**
 * <pre>
 *     @author : bytetrade
 *     e-mail : zyh2433219116@gmail.com
 *     time   : 2023/02/16
 *     desc   :
 *     version: 1.0
 * </pre>
 */
object Constants {

    const val AUTOFILL_EXTRA_URI = "uri"
    const val FRAMEWORK_SAVE_TYPE = "dataType"
    const val FRAMEWORK_SAVE_DATA = "data"

    const val ANDROID_SYSTEM_UI_PACKAGE_NAME = "com.android.systemui"
    const val ANDROID_SETTING_PACKAGE_NAME = "com.android.settings"
    const val ANDROID_SYSTEM_EDIT_VIEW = "android.widget.EditText"
    const val ANDROID_SYSTEM_AUTO_COMPLETE_TEXTVIEW = "android.widget.AutoCompleteTextView"
    const val ANDROID_WEB_INPUT_HTML_TAG = "input"

    const val VAULT_PACKAGE_NAME = APPLICATION_ID
    const val ANDROID_PACKAGE_PREFIX = "package:"
    const val ANDROID_APPLICATION_PREFIX = "androidapp://"

    const val TAG_ACCESSIBILITY = "VaultAccessibility"
    const val TAG_FRAMEWORK = "VaultAutoFill"

    const val VPN_STATUS_NO_STATE = "NoState"
    const val VPN_STATUS_IN_USE_OTHER_USER = "InUseOtherUser"
    const val VPN_STATUS_NEEDS_LOGIN = "NeedsLogin"
    const val VPN_STATUS_NEEDS_MACHINE_AUTH = "NeedsMachineAuth"
    const val VPN_STATUS_STOPPED = "Stopped"
    const val VPN_STATUS_STARTING = "Starting"
    const val VPN_STATUS_RUNNING = "Running"

    const val ACTION_HANDLE_INTENT = "$VAULT_PACKAGE_NAME.ACTION_HANDLE_INTENT"
    const val ACTION_AUTOFILL_FRAMEWORK = "$VAULT_PACKAGE_NAME.ACTION_AUTOFILL_FRAMEWORK"
    const val ACTION_AUTOFILL_FRAMEWORK_SAVE = "$VAULT_PACKAGE_NAME.ACTION_AUTOFILL_FRAMEWORK_SAVE"
    const val ACTION_AUTOFILL_ACCESSIBILITY = "$VAULT_PACKAGE_NAME.ACTION_AUTOFILL_ACCESSIBILITY"

    fun getAutoFillIntent(context: Context, uri: String?, action: String): Intent {
        return Intent(context, MainActivity::class.java).apply {
            this.putExtra(AUTOFILL_EXTRA_URI, uri)
            this.action = action
        }
    }

    fun JSONArray.toArray(): Array<Any> {
        return Array(length()) { i -> get(i) }
    }

//    fun JSONArray.toPrefixArray(): Array<Prefix> {
//        return Array(length()) { i ->
//            Prefix(
//                getJSONObject(i).getString("ip"),
//                getJSONObject(i).getInt("bitsPlusOne")
//            )
//        }
//    }

    fun JSONObject.toMap(): HashMap<String, Any>? {
        try {
            val keyIterator: Iterator<String> = this.keys()
            var key: String
            var value: Any
            val valueMap = HashMap<String, Any>()
            while (keyIterator.hasNext()) {
                key = keyIterator.next()
                value = this.getString(key)
                valueMap[key] = value
            }
            return valueMap
        } catch (e: JSONException) {
            e.printStackTrace()
        }
        return HashMap()
    }


	@JvmStatic
    fun registerStatusBar(activity: AppCompatActivity){

			val kv = MMKV.defaultMMKV()
			val theme = kv.decodeInt("theme", 1)
			var themeValue = "DEFAULT"
			var color = Color.WHITE

			Log.i("registerStatusBar ===>", "theme: " + theme)

			if (theme == 0) {
				val nightMode = isDarkThemeEnabled(activity);
				Log.i("registerStatusBar ===>1", "theme: " + nightMode)
				if (nightMode) {
					color = Color.parseColor("#1f1f1f")
				}
			} else if (theme == 1) {
				themeValue = "LIGHT"
				color = Color.WHITE
			} else if (theme == 2) {
				themeValue = "DARK"
				color = Color.parseColor("#1f1f1f")
			}

			val statusBar = StatusBar(activity)
			statusBar.setBackgroundColor(color)
			statusBar.setStyle(themeValue)
			val window: Window = activity.window
			window.navigationBarColor = color
		}

	@JvmStatic
	fun isDarkThemeEnabled(context: Context): Boolean {
		val nightModeFlags = context.resources.configuration.uiMode and
			Configuration.UI_MODE_NIGHT_MASK
		return nightModeFlags == Configuration.UI_MODE_NIGHT_YES
	}
}
