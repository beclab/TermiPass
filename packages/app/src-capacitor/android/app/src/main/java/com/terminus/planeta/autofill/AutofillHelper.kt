package com.terminus.planeta.autofill

import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.IntentSender
import android.os.Build
import android.service.autofill.FillRequest
import android.service.autofill.FillRequest.FLAG_COMPATIBILITY_MODE_REQUEST
import android.service.autofill.FillResponse
import android.service.autofill.SaveInfo
import android.service.autofill.SaveInfo.SAVE_DATA_TYPE_GENERIC
import android.service.autofill.SaveInfo.SAVE_DATA_TYPE_PASSWORD
import android.util.Log
import androidx.annotation.RequiresApi
import com.terminus.planeta.MainActivity
import com.terminus.planeta.utils.Constants
import com.terminus.planeta.utils.Constants.TAG_FRAMEWORK
import java.util.*

/**
 * <pre>
 *     @author : bytetrade
 *     e-mail : zyh2433219116@gmail.com
 *     time   : 2023/02/14
 *     desc   : helper 获取 界面结点对象 以及 准备验证的intent对象
 *     version: 1.0
 * </pre>
 */
@RequiresApi(Build.VERSION_CODES.O)
object AutofillHelper {

    // These browsers work natively with the Autofill Framework
    // So keep them in sync with:
    // - AccessibilityHelpers.{supportedBrowsers}
    val trustedBrowsers = HashSet<String>()
    // These browsers work using the compatibility shim for the Autofill Framework
    // So keep them in sync with:
    // - AccessibilityHelpers.{supportedBrowsers}
    val compatBrowsers = HashSet<String>()
    val blacklistedUris = HashSet<String>()

    init {
        trustedBrowsers.add("com.duckduckgo.mobile.android")
        trustedBrowsers.add("com.google.android.googlequicksearchbox")
        trustedBrowsers.add("org.mozilla.focus")
        trustedBrowsers.add("org.mozilla.focus.beta")
        trustedBrowsers.add("org.mozilla.focus.nightly")
        trustedBrowsers.add("org.mozilla.klar")

        compatBrowsers.add("alook.browser")
        compatBrowsers.add("alook.browser.google")
        compatBrowsers.add("app.vanadium.browser")
        compatBrowsers.add("com.amazon.cloud9")
        compatBrowsers.add("com.android.browser")
        compatBrowsers.add("com.android.chrome")
        compatBrowsers.add("com.android.htmlviewer")
        compatBrowsers.add("com.avast.android.secure.browser")
        compatBrowsers.add("com.avg.android.secure.browser")
        compatBrowsers.add("com.brave.browser")
        compatBrowsers.add("com.brave.browser_beta")
        compatBrowsers.add("com.brave.browser_default")
        compatBrowsers.add("com.brave.browser_dev")
        compatBrowsers.add("com.brave.browser_nightly")
        compatBrowsers.add("com.chrome.beta")
        compatBrowsers.add("com.chrome.canary")
        compatBrowsers.add("com.chrome.dev")
        compatBrowsers.add("com.cookiegames.smartcookie")
        compatBrowsers.add("com.cookiejarapps.android.smartcookieweb")
        compatBrowsers.add("com.ecosia.android")
        compatBrowsers.add("com.google.android.apps.chrome")
        compatBrowsers.add("com.google.android.apps.chrome_dev")
        compatBrowsers.add("com.google.android.captiveportallogin")
        compatBrowsers.add("com.iode.firefox")
        compatBrowsers.add("com.jamal2367.styx")
        compatBrowsers.add("com.kiwibrowser.browser")
        compatBrowsers.add("com.kiwibrowser.browser.dev")
        compatBrowsers.add("com.lemurbrowser.exts")
        compatBrowsers.add("com.microsoft.emmx")
        compatBrowsers.add("com.microsoft.emmx.beta")
        compatBrowsers.add("com.microsoft.emmx.canary")
        compatBrowsers.add("com.microsoft.emmx.dev")
        compatBrowsers.add("com.mmbox.browser")
        compatBrowsers.add("com.mmbox.xbrowser")
        compatBrowsers.add("com.mycompany.app.soulbrowser")
        compatBrowsers.add("com.naver.whale")
        compatBrowsers.add("com.neeva.app")
        compatBrowsers.add("com.opera.browser")
        compatBrowsers.add("com.opera.browser.beta")
        compatBrowsers.add("com.opera.gx")
        compatBrowsers.add("com.opera.mini.native")
        compatBrowsers.add("com.opera.mini.native.beta")
        compatBrowsers.add("com.opera.touch")
        compatBrowsers.add("com.qflair.browserq")
        compatBrowsers.add("com.qwant.liberty")
        compatBrowsers.add("com.rainsee.create")
        compatBrowsers.add("com.sec.android.app.sbrowser")
        compatBrowsers.add("com.sec.android.app.sbrowser.beta")
        compatBrowsers.add("com.stoutner.privacybrowser.free")
        compatBrowsers.add("com.stoutner.privacybrowser.standard")
        compatBrowsers.add("com.vivaldi.browser")
        compatBrowsers.add("com.vivaldi.browser.snapshot")
        compatBrowsers.add("com.vivaldi.browser.sopranos")
        compatBrowsers.add("com.yandex.browser")
        compatBrowsers.add("com.yjllq.internet")
        compatBrowsers.add("com.yjllq.kito")
        compatBrowsers.add("com.yujian.ResideMenuDemo")
        compatBrowsers.add("com.z28j.feel")
        compatBrowsers.add("idm.internet.download.manager")
        compatBrowsers.add("idm.internet.download.manager.adm.lite")
        compatBrowsers.add("idm.internet.download.manager.plus")
        compatBrowsers.add("io.github.forkmaintainers.iceraven")
        compatBrowsers.add("mark.via")
        compatBrowsers.add("mark.via.gp")
        compatBrowsers.add("net.dezor.browser")
        compatBrowsers.add("net.slions.fulguris.full.download")
        compatBrowsers.add("net.slions.fulguris.full.download.debug")
        compatBrowsers.add("net.slions.fulguris.full.playstore")
        compatBrowsers.add("net.slions.fulguris.full.playstore.debug")
        compatBrowsers.add("org.adblockplus.browser")
        compatBrowsers.add("org.adblockplus.browser.beta")
        compatBrowsers.add("org.bromite.bromite")
        compatBrowsers.add("org.bromite.chromium")
        compatBrowsers.add("org.chromium.chrome")
        compatBrowsers.add("org.codeaurora.swe.browser")
        compatBrowsers.add("org.gnu.icecat")
        compatBrowsers.add("org.mozilla.fenix")
        compatBrowsers.add("org.mozilla.fenix.nightly")
        compatBrowsers.add("org.mozilla.fennec_aurora")
        compatBrowsers.add("org.mozilla.fennec_fdroid")
        compatBrowsers.add("org.mozilla.firefox")
        compatBrowsers.add("org.mozilla.firefox_beta")
        compatBrowsers.add("org.mozilla.reference.browser")
        compatBrowsers.add("org.mozilla.rocket")
        compatBrowsers.add("org.torproject.torbrowser")
        compatBrowsers.add("org.torproject.torbrowser_alpha")
        compatBrowsers.add("org.ungoogled.chromium.extensions.stable")
        compatBrowsers.add("org.ungoogled.chromium.stable")
        compatBrowsers.add("us.spotco.fennec_dos")

        blacklistedUris.add("${Constants.ANDROID_APPLICATION_PREFIX}android")
        blacklistedUris.add("${Constants.ANDROID_APPLICATION_PREFIX}${Constants.ANDROID_SETTING_PACKAGE_NAME}")
        blacklistedUris.add("${Constants.ANDROID_APPLICATION_PREFIX}${Constants.VAULT_PACKAGE_NAME}")
        blacklistedUris.add("${Constants.ANDROID_APPLICATION_PREFIX}com.oneplus.applocker")
    }

    fun getManualIntentSenderForResponse(uri: String?, context: Context): IntentSender {
        val intent = Constants.getAutoFillIntent(
            context,
            uri,
            Constants.ACTION_AUTOFILL_FRAMEWORK
        );
        return PendingIntent.getActivity(
            context,
            1001,
            intent,
            addPendingIntentMutabilityFlag(PendingIntent.FLAG_CANCEL_CURRENT, true)
        ).intentSender
    }

    fun getAutoFillSavePendingIntent(
        context: Context,
        uri: String?,
        @SaveDataType saveType: String,
        json: String,
        openNew : Boolean = false
    ): PendingIntent {
        val intent = Intent(context, MainActivity::class.java).apply {
            this.putExtra(Constants.AUTOFILL_EXTRA_URI, uri)
            this.putExtra(Constants.FRAMEWORK_SAVE_TYPE, saveType)
            this.putExtra(Constants.FRAMEWORK_SAVE_DATA, json)
            this.action = Constants.ACTION_AUTOFILL_FRAMEWORK_SAVE
        }
        if (openNew){
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
        }
        return PendingIntent.getActivity(
            context,
            1002,
            intent,
            addPendingIntentMutabilityFlag(PendingIntent.FLAG_CANCEL_CURRENT, true)
        )
    }

    /**
     * flags @PendingIntent.Flags
     */
    fun addPendingIntentMutabilityFlag(flags : Int, isMutable: Boolean): Int {
        //Mutable flag was added on API level 31
        if (isMutable && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            return flags or PendingIntent.FLAG_MUTABLE
        }

        //Immutable flag was added on API level 23
        return if (!isMutable && Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags or PendingIntent.FLAG_IMMUTABLE
        } else flags
    }

    fun addSaveInfo(
        parser: StructureParser,
        fillRequest: FillRequest?,
        responseBuilder: FillResponse.Builder
    ) {
        // Docs state that password fields cannot be reliably saved in Compat mode since they will show as
        // masked values.
        var compatRequest: Boolean? = null
        val collection = parser.getCollection()
        Log.i(TAG_FRAMEWORK, "addSaveInfo: $collection    ${collection.fieldHintMap}")
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q && fillRequest != null) {
            // Attempt to automatically establish compat request mode on Android 10+
            compatRequest =
                (fillRequest.flags or FLAG_COMPATIBILITY_MODE_REQUEST) == fillRequest.flags;
        }
        val compatBrowser: Boolean =
            compatRequest ?: compatBrowsers.contains(parser.getPackageName())
        if (compatBrowser && collection.saveType == SAVE_DATA_TYPE_PASSWORD) {
            Log.i(TAG_FRAMEWORK, "return 1")
            Log.i(TAG_FRAMEWORK, "$compatBrowser ${collection.saveType}")
            return
        }

        val requiredIds = collection.getRequiredSaveFields()
        if (collection.saveType == SAVE_DATA_TYPE_GENERIC || requiredIds.isNullOrEmpty()) {
            Log.i(TAG_FRAMEWORK, "return 2")
            Log.i(TAG_FRAMEWORK, "${requiredIds.isNullOrEmpty()} ${collection.saveType}")
            return
        }
        Log.i(TAG_FRAMEWORK, "requiredIds ： ${requiredIds.toTypedArray()}")
        val saveBuilder = SaveInfo.Builder(collection.saveType, requiredIds.toTypedArray())
        val optionalIds = collection.getOptionalSaveIds()
        if (!optionalIds.isNullOrEmpty()) {
            Log.i(TAG_FRAMEWORK, "optionalIds ： ${optionalIds.toTypedArray()}")
            saveBuilder.setOptionalIds(optionalIds.toTypedArray())
        }
        if (compatBrowser) {
            saveBuilder.setFlags(SaveInfo.FLAG_SAVE_ON_ALL_VIEWS_INVISIBLE)
        }
        Log.i(TAG_FRAMEWORK, "save success : ${collection.saveType}")
        responseBuilder.setSaveInfo(saveBuilder.build())
    }
}