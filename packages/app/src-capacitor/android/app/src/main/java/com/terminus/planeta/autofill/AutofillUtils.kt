package com.terminus.planeta.autofill

import android.app.Activity
import android.app.AlertDialog
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.view.autofill.AutofillManager
import androidx.annotation.RequiresApi
import com.terminus.planeta.utils.Constants


/**
 * <pre>
 *     @author : bytetrade
 *     e-mail : zyh2433219116@gmail.com
 *     time   : 2023/02/13
 *     desc   : 工具类 setting请求权限
 *     version: 1.0
 * </pre>
 */

object AutofillUtils {

    @RequiresApi(Build.VERSION_CODES.O)
    fun hasEnableAutoFillService(context: Context): Boolean {
        val autofillManager: AutofillManager = context.getSystemService(AutofillManager::class.java)
        return autofillManager.hasEnabledAutofillServices() && autofillManager.isEnabled
    }

    fun isSupportAutoFillService(context: Context): Boolean {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val autofillManager: AutofillManager =
                context.getSystemService(AutofillManager::class.java)
            return autofillManager.isAutofillSupported
        }
        return false
    }

    @RequiresApi(Build.VERSION_CODES.O)
    fun openAutofillSettingPage(activity: Activity) {
        try {
//            autofill开启当前应用服务，此设置界面不会开启
//            val intent = Intent(Settings.ACTION_REQUEST_SET_AUTOFILL_SERVICE).apply {
//                this.data =
//                    Uri.parse("${Constants.ANDROID_PACKAGE_PREFIX}${Constants.VAULT_PACKAGE_NAME}")
//            }
//            activity.startActivity(intent)
//        } catch (e: ActivityNotFoundException) {
            val intent = Intent(Settings.ACTION_REQUEST_SET_AUTOFILL_SERVICE).apply {
                this.data =
                    Uri.parse("${Constants.ANDROID_PACKAGE_PREFIX}${Constants.ANDROID_SETTING_PACKAGE_NAME}")
            }
            activity.startActivity(intent)
        } catch (e: Exception) {
            AlertDialog.Builder(activity).setMessage("没有找到系统设置界面，请在设置界面手动开启自动填充功能")
                .setCancelable(true)
                .setPositiveButton("ok") { dialog, _ -> dialog.cancel() }
                .create()
                .show()
        }
    }

    @RequiresApi(Build.VERSION_CODES.O)
    fun disableAutofillService(context: Context) {
        val autofillManager: AutofillManager = context.getSystemService(AutofillManager::class.java)
        autofillManager.disableAutofillServices()
    }

}