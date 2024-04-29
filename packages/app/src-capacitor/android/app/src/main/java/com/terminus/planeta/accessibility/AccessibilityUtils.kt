package com.terminus.planeta.accessibility

import android.app.AlertDialog
import android.app.AppOpsManager
import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.net.Uri
import android.os.Build
import android.os.Process
import android.provider.Settings
import android.util.Log
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import androidx.annotation.RequiresApi
import com.terminus.planeta.VaultApp
import com.terminus.planeta.utils.Constants

/**
 * <pre>
 *     @author : bytetrade
 *     e-mail : zyh2433219116@gmail.com
 *     time   : 2023/02/02
 *     desc   :
 *     version: 1.0
 * </pre>
 */
object AccessibilityUtils {

    fun openAccessibilitySettingPage(context: Context) {
        try {
            val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
            context.startActivity(intent)
        } catch (e: ActivityNotFoundException) {
            val intent = Intent(Settings.ACTION_SETTINGS)
            context.startActivity(intent)
        } catch (e: Exception) {
            AlertDialog.Builder(context)
                .setMessage("The system setting interface cannot be found, please manually enable the accessibility function of the current application in the setting interface")
                .setCancelable(true)
                .setPositiveButton("ok") { dialog, _ -> dialog.cancel() }
                .create()
                .show()
        }
    }

    @RequiresApi(Build.VERSION_CODES.M)
    fun openOverlaySettingPage(context: Context) {
        try {
            val intent = Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION).apply {
                data =
                    Uri.parse("${Constants.ANDROID_PACKAGE_PREFIX}${Constants.VAULT_PACKAGE_NAME}")
            }
            context.startActivity(intent)
        } catch (e: ActivityNotFoundException) {
            val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                data =
                    Uri.parse("${Constants.ANDROID_PACKAGE_PREFIX}${Constants.VAULT_PACKAGE_NAME}")
            }
            context.startActivity(intent)
        } catch (e: Exception) {
            AlertDialog.Builder(context)
                .setMessage("The system setting interface cannot be found, please manually enable the suspension function of the current application in the setting interface")
                .setCancelable(true)
                .setPositiveButton("ok") { dialog, _ -> dialog.cancel() }
                .create()
                .show()
        }
    }

    fun isAccessibilityServiceRunning(): Boolean {
        val runningServices = Settings.Secure.getString(
            VaultApp.application?.contentResolver,
            Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
        ) ?: return false
        val string : String = Constants.VAULT_PACKAGE_NAME;
        return runningServices.contains(string)
    }

    fun isOverlayEnable(context: Context): Boolean {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (Settings.canDrawOverlays(context)) {
                return true
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                val appOpsManager =
                    context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
                val mode = appOpsManager.unsafeCheckOpNoThrow(
                    "android:system_alert_window",
                    Process.myUid(),
                    Constants.VAULT_PACKAGE_NAME
                )
                if (mode == AppOpsManager.MODE_ALLOWED || mode == AppOpsManager.MODE_IGNORED) {
                    return true
                }

                try {
                    val wm = context.getSystemService(Context.WINDOW_SERVICE) as WindowManager
                    val testView = View(context)
                    val layoutParams = getOverlayLayoutParams();
                    wm.addView(testView, layoutParams);
                    wm.removeView(testView);
                    return true;
                } catch (e : Exception){
                    Log.i("error", "isOverlayEnable: $e")
                }

                return false
            }
        }
        return true
    }

    fun getOverlayLayoutParams(): WindowManager.LayoutParams? {
        var windowManagerType = WindowManager.LayoutParams.TYPE_PHONE;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            windowManagerType = WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        }
        val layoutParams = WindowManager.LayoutParams(
            ViewGroup.LayoutParams.WRAP_CONTENT,
            ViewGroup.LayoutParams.WRAP_CONTENT,
            windowManagerType,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
            PixelFormat.TRANSPARENT
        )
        layoutParams.gravity = Gravity.TOP or Gravity.LEFT
        return layoutParams
    }
}