package com.terminus.planeta.accessibility

import android.net.Uri
import android.os.Bundle
import android.util.Patterns
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import androidx.core.view.accessibility.AccessibilityNodeInfoCompat
import com.terminus.planeta.utils.Constants
import java.util.*


/**
 * <pre>
 * @author : bytetrade
 * e-mail : zyh2433219116@gmail.com
 * time   : 2023/02/03
 * desc   :
 * version: 1.0
</pre> *
 */
object AccessibilityHelper {

    //So keep them in sync with:
    //   - AutofillHelpers.{trustedBrowsers,compatBrowsers}
    private val supportedBrowsers = mutableListOf<Browser>()
    val filteredPackageNames = mutableListOf(
        Constants.ANDROID_SYSTEM_UI_PACKAGE_NAME,
        "com.google.android.googlequicksearchbox",
        "com.google.android.apps.nexuslauncher",
        "com.google.android.launcher",
        "com.computer.desktop.ui.launcher",
        "com.launcher.notelauncher",
        "com.anddoes.launcher",
        "com.actionlauncher.playstore",
        "ch.deletescape.lawnchair.plah",
        "com.microsoft.launcher",
        "com.teslacoilsw.launcher",
        "com.teslacoilsw.launcher.prime",
        "is.shortcut",
        "me.craftsapp.nlauncher",
        "com.ss.squarehome2",
        "com.treydev.pns"
    )

    init {
        supportedBrowsers.add(Browser("alook.browser", "search_fragment_input_view"))
        supportedBrowsers.add(Browser("alook.browser.google", "search_fragment_input_view"))
        supportedBrowsers.add(Browser("com.amazon.cloud9", "url"))
        supportedBrowsers.add(Browser("com.android.browser", "url"))
        supportedBrowsers.add(Browser("com.android.chrome", "url_bar"))
        // Rem. for "com.android.htmlviewer": doesn't have a URL bar, therefore not present here.
        supportedBrowsers.add(Browser("com.avast.android.secure.browser", "editor"))
        supportedBrowsers.add(Browser("com.avg.android.secure.browser", "editor"))
        supportedBrowsers.add(Browser("com.brave.browser", "url_bar"))
        supportedBrowsers.add(Browser("com.brave.browser_beta", "url_bar"))
        supportedBrowsers.add(Browser("com.brave.browser_default", "url_bar"))
        supportedBrowsers.add(Browser("com.brave.browser_dev", "url_bar"))
        supportedBrowsers.add(Browser("com.brave.browser_nightly", "url_bar"))
        supportedBrowsers.add(Browser("com.chrome.beta", "url_bar"))
        supportedBrowsers.add(Browser("com.chrome.canary", "url_bar"))
        supportedBrowsers.add(Browser("com.chrome.dev", "url_bar"))
        supportedBrowsers.add(Browser("com.cookiegames.smartcookie", "search"))
        supportedBrowsers.add(Browser("com.cookiejarapps.android.smartcookieweb", "mozac_browser_toolbar_url_view"))
        supportedBrowsers.add(Browser("com.duckduckgo.mobile.android", "omnibarTextInput"))
        supportedBrowsers.add(Browser("com.ecosia.android", "url_bar"))
        supportedBrowsers.add(Browser("com.google.android.apps.chrome", "url_bar"))
        supportedBrowsers.add(Browser("com.google.android.apps.chrome_dev", "url_bar"))
        // Rem. for "com.google.android.captiveportallogin": URL displayed in ActionBar subtitle without viewId.
        supportedBrowsers.add(Browser("com.iode.firefox", "mozac_browser_toolbar_url_view"))
        supportedBrowsers.add(Browser("com.jamal2367.styx", "search"))
        supportedBrowsers.add(Browser("com.kiwibrowser.browser", "url_bar"))
        supportedBrowsers.add(Browser("com.kiwibrowser.browser.dev", "url_bar"))
        supportedBrowsers.add(Browser("com.microsoft.emmx", "url_bar"))
        supportedBrowsers.add(Browser("com.microsoft.emmx.beta", "url_bar"))
        supportedBrowsers.add(Browser("com.microsoft.emmx.canary", "url_bar"))
        supportedBrowsers.add(Browser("com.microsoft.emmx.dev", "url_bar"))
        supportedBrowsers.add(Browser("com.mmbox.browser", "search_box"))
        supportedBrowsers.add(Browser("com.mmbox.xbrowser", "search_box"))
        supportedBrowsers.add(Browser("com.mycompany.app.soulbrowser", "edit_text"))
        supportedBrowsers.add(Browser("com.naver.whale", "url_bar"))
        supportedBrowsers.add(Browser("com.opera.browser", "url_field"))
        supportedBrowsers.add(Browser("com.opera.browser.beta", "url_field"))
        supportedBrowsers.add(Browser("com.opera.gx", "addressbarEdit"))
        supportedBrowsers.add(Browser("com.opera.mini.native", "url_field"))
        supportedBrowsers.add(Browser("com.opera.mini.native.beta", "url_field"))
        supportedBrowsers.add(Browser("com.opera.touch", "addressbarEdit"))
        supportedBrowsers.add(Browser("com.qflair.browserq", "url"))
        supportedBrowsers.add(Browser("com.qwant.liberty", "mozac_browser_toolbar_url_view,url_bar_title")) // 2nd = Legacy (before v4)
        supportedBrowsers.add(Browser("com.sec.android.app.sbrowser", "location_bar_edit_text"))
        supportedBrowsers.add(Browser("com.sec.android.app.sbrowser.beta", "location_bar_edit_text"))
        supportedBrowsers.add(Browser("com.stoutner.privacybrowser.free", "url_edittext"))
        supportedBrowsers.add(Browser("com.stoutner.privacybrowser.standard", "url_edittext"))
        supportedBrowsers.add(Browser("com.vivaldi.browser", "url_bar"))
        supportedBrowsers.add(Browser("com.vivaldi.browser.snapshot", "url_bar"))
        supportedBrowsers.add(Browser("com.vivaldi.browser.sopranos", "url_bar"))
        supportedBrowsers.add(object : Browser("com.yandex.browser", "bro_omnibar_address_title_text,bro_omnibox_collapsed_title"){
            override fun getUriFunction(uri: String): String {
                val first = uri.split("\\s+").firstOrNull()
                return first ?: ""
            }
        })
        supportedBrowsers.add(Browser("com.z28j.feel", "g2"))
        supportedBrowsers.add(Browser("idm.internet.download.manager", "search"))
        supportedBrowsers.add(Browser("idm.internet.download.manager.adm.lite", "search"))
        supportedBrowsers.add(Browser("idm.internet.download.manager.plus", "search"))
        supportedBrowsers.add(Browser("io.github.forkmaintainers.iceraven", "mozac_browser_toolbar_url_view"))
        supportedBrowsers.add(Browser("mark.via", "am,an"))
        supportedBrowsers.add(Browser("mark.via.gp", "as"))
        supportedBrowsers.add(Browser("net.slions.fulguris.full.download", "search"))
        supportedBrowsers.add(Browser("net.slions.fulguris.full.download.debug", "search"))
        supportedBrowsers.add(Browser("net.slions.fulguris.full.playstore", "search"))
        supportedBrowsers.add(Browser("net.slions.fulguris.full.playstore.debug", "search"))
        supportedBrowsers.add(Browser("org.adblockplus.browser", "url_bar,url_bar_title")) // 2nd = Legacy (before v2)
        supportedBrowsers.add(Browser("org.adblockplus.browser.beta", "url_bar,url_bar_title")) // 2nd = Legacy (before v2)
        supportedBrowsers.add(Browser("org.bromite.bromite", "url_bar"))
        supportedBrowsers.add(Browser("org.bromite.chromium", "url_bar"))
        supportedBrowsers.add(Browser("org.chromium.chrome", "url_bar"))
        supportedBrowsers.add(Browser("org.codeaurora.swe.browser", "url_bar"))
        supportedBrowsers.add(Browser("org.gnu.icecat", "url_bar_title,mozac_browser_toolbar_url_view")) // 2nd = Anticipation
        supportedBrowsers.add(Browser("org.mozilla.fenix", "mozac_browser_toolbar_url_view"))
        supportedBrowsers.add(Browser("org.mozilla.fenix.nightly", "mozac_browser_toolbar_url_view")) // [DEPRECATED ENTRY]
        supportedBrowsers.add(Browser("org.mozilla.fennec_aurora", "mozac_browser_toolbar_url_view,url_bar_title")) // [DEPRECATED ENTRY]
        supportedBrowsers.add(Browser("org.mozilla.fennec_fdroid", "mozac_browser_toolbar_url_view,url_bar_title")) // 2nd = Legacy
        supportedBrowsers.add(Browser("org.mozilla.firefox", "mozac_browser_toolbar_url_view,url_bar_title")) // 2nd = Legacy
        supportedBrowsers.add(Browser("org.mozilla.firefox_beta", "mozac_browser_toolbar_url_view,url_bar_title")) // 2nd = Legacy
        supportedBrowsers.add(Browser("org.mozilla.focus", "mozac_browser_toolbar_url_view,display_url")) // 2nd = Legacy
        supportedBrowsers.add(Browser("org.mozilla.focus.beta", "mozac_browser_toolbar_url_view,display_url")) // 2nd = Legacy
        supportedBrowsers.add(Browser("org.mozilla.focus.nightly", "mozac_browser_toolbar_url_view,display_url")) // 2nd = Legacy
        supportedBrowsers.add(Browser("org.mozilla.klar", "mozac_browser_toolbar_url_view,display_url")) // 2nd = Legacy
        supportedBrowsers.add(Browser("org.mozilla.reference.browser", "mozac_browser_toolbar_url_view"))
        supportedBrowsers.add(Browser("org.mozilla.rocket", "display_url"))
        supportedBrowsers.add(Browser("org.torproject.torbrowser", "mozac_browser_toolbar_url_view,url_bar_title")) // 2nd = Legacy (before v10.0.3)
        supportedBrowsers.add(Browser("org.torproject.torbrowser_alpha", "mozac_browser_toolbar_url_view,url_bar_title")) // 2nd = Legacy (before v10.0a8)
        supportedBrowsers.add(Browser("org.ungoogled.chromium.extensions.stable", "url_bar"))
        supportedBrowsers.add(Browser("org.ungoogled.chromium.stable", "url_bar"))
        supportedBrowsers.add(Browser("us.spotco.fennec_dos", "mozac_browser_toolbar_url_view,url_bar_title")) // 2nd = Legacy

        // [Section B] Entries only present here
        //
        // FIXME: Test the compatibility of these with Autofill Framework
        supportedBrowsers.add(Browser("acr.browser.barebones", "search"))
        supportedBrowsers.add(Browser("acr.browser.lightning", "search"))
        supportedBrowsers.add(Browser("com.feedback.browser.wjbrowser", "addressbar_url"))
        supportedBrowsers.add(Browser("com.ghostery.android.ghostery", "search_field"))
        supportedBrowsers.add(Browser("com.htc.sense.browser", "title"))
        supportedBrowsers.add(Browser("com.jerky.browser2", "enterUrl"))
        supportedBrowsers.add(Browser("com.ksmobile.cb", "address_bar_edit_text"))
        supportedBrowsers.add(Browser("com.linkbubble.playstore", "url_text"))
        supportedBrowsers.add(Browser("com.mx.browser", "address_editor_with_progress"))
        supportedBrowsers.add(Browser("com.mx.browser.tablet", "address_editor_with_progress"))
        supportedBrowsers.add(Browser("com.nubelacorp.javelin", "enterUrl"))
        supportedBrowsers.add(Browser("jp.co.fenrir.android.sleipnir", "url_text"))
        supportedBrowsers.add(Browser("jp.co.fenrir.android.sleipnir_black", "url_text"))
        supportedBrowsers.add(Browser("jp.co.fenrir.android.sleipnir_test", "url_text"))
        supportedBrowsers.add(Browser("mobi.mgeek.TunnyBrowser", "title"))
        supportedBrowsers.add(Browser("org.iron.srware", "url_bar"))
    }

    var tempCredential: AppCredential? = null

    fun cleanLastCredential() {
        tempCredential = null
    }

    fun hasAutoFillData(): Boolean {
        return tempCredential != null
    }

    fun fillCredential(
        nameNode: AccessibilityNodeInfo?,
        pwdList: MutableList<AccessibilityNodeInfo>
    ) {
        fillEditText(nameNode, tempCredential?.userName);
        pwdList.forEach {
            fillEditText(it, tempCredential?.password)
        }
    }

    private fun fillEditText(editTextNode: AccessibilityNodeInfo?, value: String?) {
        if (editTextNode == null || value == null) {
            return
        }
        val bundle = Bundle()
        bundle.putString(AccessibilityNodeInfoCompat.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE, value)
        editTextNode.performAction(AccessibilityNodeInfoCompat.ACTION_SET_TEXT, bundle)
    }

    fun getBrowserUri(root: AccessibilityNodeInfo): String? {
        var uri: String? = Constants.ANDROID_APPLICATION_PREFIX + root.packageName
        val browser = supportedBrowsers.find {
            it.packageName() == root.packageName
        }
        if (browser != null) {
            val listNode =
                root.findAccessibilityNodeInfosByViewId("${browser.packageName()}:id/${browser.uriViewId()}")
            val node = listNode.firstOrNull()
            if (node != null) {
                uri = extractUri(uri, node, browser)
                node.recycle()
            } else {
                uri = null
            }
        }
        return uri
    }

    private fun extractUri(
        uri: String?,
        addressNode: AccessibilityNodeInfo?,
        browser: Browser
    ): String? {
        if (addressNode?.text == null) return uri
        val tempUri = browser.getUriFunction(addressNode.text.toString())
        if (tempUri.contains(".")) {
            val hasHttpProtocol = tempUri.startsWith("http://") || tempUri.startsWith("https://");
            if (!hasHttpProtocol && tempUri.contains(".")) {
                if (Patterns.WEB_URL.matcher("https://$tempUri").matches()) {
                    val parseUri = Uri.parse("https://$tempUri")
                    return parseUri.host
                }
            }
            if (Patterns.WEB_URL.matcher(tempUri).matches()) {
                val parseUri = Uri.parse(tempUri)
                return parseUri.host
            }
        }
        return tempUri;
    }

    fun getAllViews(
        nodeInfo: AccessibilityNodeInfo?,
        event: AccessibilityEvent,
        disposeIfUnused: Boolean,
        condition: ((node: AccessibilityNodeInfo?) -> Boolean)
    ): MutableList<AccessibilityNodeInfo> {
        val nodeDeque: Deque<AccessibilityNodeInfo> = LinkedList()
        val list = mutableListOf<AccessibilityNodeInfo>()
        var node: AccessibilityNodeInfo? = nodeInfo
        if (node != null) {
            nodeDeque.push(node)
            var dispose = disposeIfUnused
            while (!nodeDeque.isEmpty()) {
                val pop = nodeDeque.pop()
                if (pop != null) {
                    node = pop
                    if (node.windowId == event.windowId && condition(node)) {
                        dispose = false
                        list.add(node)
                    }
                    for (index in 0 until node.childCount) {
                        nodeDeque.addLast(node.getChild(index))
                    }
                }
            }
            if (dispose) {
                nodeInfo?.recycle()
            }
        }
        return list
    }

    fun isEditText(node: AccessibilityNodeInfo?): Boolean {
        return (node?.className?.contains("EditText") == true || node?.className?.contains("AutoCompleteTextView") == true)
    }

    fun getUsernameEdtByPwdEdt(allEdts: MutableList<AccessibilityNodeInfo>): AccessibilityNodeInfo? {
        var previousEditText: AccessibilityNodeInfo? = null
        allEdts.forEach {
            if (it.isPassword) {
                return previousEditText
            }
            previousEditText = it
        }
        return null
    }

    fun isUsernameEdt(
        root: AccessibilityNodeInfo?,
        event: AccessibilityEvent
    ): Boolean {
        val allEdtViews = getAllViews(root, event, false) {
            isEditText(node = it)
        }
        val useName = getUsernameEdtByPwdEdt(allEdtViews)
        var isUsernameEditText = false
        if (useName != null) {
            isUsernameEditText = isSameNode(useName, event.source)
        }


        return isUsernameEditText;
    }

    private fun isSameNode(node1: AccessibilityNodeInfo?, node2: AccessibilityNodeInfo?): Boolean {
        return if (node1 != null && node2 != null) {
            node1 == node2 || node1.hashCode() == node2.hashCode()
        } else false
    }

    fun checkResultUri(uri: String?): Boolean {
        return uri != null && tempCredential != null && uri.contains(Regex(tempCredential?.url!!))
    }

}