package com.terminus.planeta.accessibility

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.graphics.PixelFormat
import android.graphics.Rect
import android.os.*
import android.util.DisplayMetrics
import android.util.Log
import android.view.*
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import androidx.core.hardware.display.DisplayManagerCompat
import com.terminus.planeta.R
import com.terminus.planeta.utils.Constants
import com.terminus.planeta.utils.Constants.TAG_ACCESSIBILITY
import com.terminus.planeta.utils.Utils


/**
 * <pre>
 *     @author : bytetrade
 *     e-mail : zyh2433219116@gmail.com
 *     time   : 2023/02/02
 *     desc   :
 *     version: 1.0
 * </pre>
 */
class VaultAccessibilityService : AccessibilityService() {

    private lateinit var windowManager: WindowManager
    private var floatRootView: View? = null
    private var _lastLauncherSetBuilt: Long = 0
    private var _launcherPackageNames: HashSet<String>? = null

    override fun onServiceConnected() {
        super.onServiceConnected()
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {

        val powerManager = getSystemService(POWER_SERVICE) as PowerManager
        //4.2开始通过isInteractive判断屏幕状态
        if (Build.VERSION.SDK_INT > Build.VERSION_CODES.KITKAT_WATCH && !powerManager.isInteractive) {
            removeSuspendedWindow()
            return
        }

        if (skipPackage(event?.packageName.toString())) {
            if (event?.packageName != "com.android.systemui") {
                removeSuspendedWindow();
            }
            Log.i(TAG_ACCESSIBILITY, "  =>>>>>> event 0 $event")
            return
        }

        val root: AccessibilityNodeInfo?
        when (event?.eventType) {
            AccessibilityEvent.TYPE_VIEW_CLICKED,
            AccessibilityEvent.TYPE_VIEW_FOCUSED -> {
                if (event.source == null || event.packageName == Constants.VAULT_PACKAGE_NAME) {
                    removeSuspendedWindow()
                    Log.i(TAG_ACCESSIBILITY, "  =>>>>>> event 1 $event")
                    return
                }
                root = rootInActiveWindow
                if (root == null || root.packageName != event.packageName) {
                    Log.i(TAG_ACCESSIBILITY, "  =>>>>>> event 2 $event")
                    return
                }
                if (!(event.source?.isPassword)!! && !AccessibilityHelper.isUsernameEdt(
                        root,
                        event
                    )
                ) {
                    removeSuspendedWindow()
                    Log.i(TAG_ACCESSIBILITY, "  =>>>>>> event 3 $event")
                    return
                }
                if (scanEdtAndAutoFill(root, event)) {
                    removeSuspendedWindow()
                    Log.i(TAG_ACCESSIBILITY, "  =>>>>>> event 4 $event")
                } else {
                    addSuspendedWindow(root, event)
                    Log.i(TAG_ACCESSIBILITY, "  =>>>>>> event 5 $event")
                }
            }
            AccessibilityEvent.TYPE_VIEW_SCROLLED -> {
                if (event.source == null || event.packageName ==  Constants.VAULT_PACKAGE_NAME) {
                    removeSuspendedWindow()
                    Log.i(TAG_ACCESSIBILITY, "  =>>>>>> event 6 $event")
                    return
                }
                root = rootInActiveWindow
                if (root == null || root.packageName != event.packageName) {
                    Log.i(TAG_ACCESSIBILITY, "  =>>>>>> event 7 $event")
                    return
                }
                Log.i(TAG_ACCESSIBILITY, "  =>>>>>> event 8 $event")
                updateSuspendedWindow(root, event)
            }
            AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED,
            AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED -> {
                if (!AccessibilityHelper.hasAutoFillData()) {
                    Log.i(TAG_ACCESSIBILITY, "  =>>>>>> event 9 $event")
                    return
                }
                root = rootInActiveWindow
                if (root == null || root.packageName != event.packageName) {
                    Log.i(TAG_ACCESSIBILITY, "  =>>>>>> event 10 $event")
                    return
                }
                if (scanEdtAndAutoFill(root, event)) {
                    removeSuspendedWindow()
                    Log.i(TAG_ACCESSIBILITY, "  =>>>>>> event 11 $event")
                }
            }
            else -> {
                //Do Nothing
            }
        }
    }

    private fun scanEdtAndAutoFill(
        root: AccessibilityNodeInfo,
        event: AccessibilityEvent
    ): Boolean {
        var filled = false
        val uri = AccessibilityHelper.getBrowserUri(root)
        Log.i(TAG_ACCESSIBILITY, "  =>>>>>> data ${AccessibilityHelper.tempCredential}")
        if (AccessibilityHelper.checkResultUri(uri)) {
            val allEdtViews = AccessibilityHelper.getAllViews(root, event, false) {
                AccessibilityHelper.isEditText(node = it)
            }
            val useName = AccessibilityHelper.getUsernameEdtByPwdEdt(allEdtViews)
            val pwdList = AccessibilityHelper.getAllViews(root, event, false) {
                it?.isPassword ?: false
            }
            if (useName != null || pwdList.size > 0) {
                AccessibilityHelper.fillCredential(useName, pwdList)
                filled = true
                AccessibilityHelper.cleanLastCredential()
            }
        }
        Log.i(TAG_ACCESSIBILITY, "  =>>>>>> data status $filled")
        return filled
    }

    private fun removeSuspendedWindow() {
        if (floatRootView != null) {
            windowManager.removeViewImmediate(floatRootView)
        }
        floatRootView = null
    }

    private fun skipPackage(eventPackageName: String?): Boolean {
        if (eventPackageName.isNullOrEmpty() ||
            AccessibilityHelper.filteredPackageNames.contains(eventPackageName) ||
            eventPackageName.contains("launcher")
        ) {
            return true
        }
        if (_launcherPackageNames == null || (System.currentTimeMillis() - _lastLauncherSetBuilt) > 60 * 1000) {
            // refresh launcher list every now and then
            _lastLauncherSetBuilt = System.currentTimeMillis()
            val intent = Intent(Intent.ACTION_MAIN)
            intent.addCategory(Intent.CATEGORY_HOME)
            val resolveInfo = packageManager.queryIntentActivities(intent, 0);
            _launcherPackageNames = resolveInfo.map {
                it.activityInfo.packageName
            }.toHashSet();
        }
        return _launcherPackageNames?.contains(eventPackageName) ?: false
    }

    override fun onInterrupt() {
        //Do Nothing
    }

    private fun addSuspendedWindow(root: AccessibilityNodeInfo, event: AccessibilityEvent) {
        val target: AccessibilityNodeInfo? = event.source
        if (target != null) {
            val rec = Rect()
            target.getBoundsInScreen(rec)
            if (floatRootView == null) {
                floatRootView =
                    LayoutInflater.from(this).inflate(R.layout.item_accessiblity_autofill, null)
                floatRootView?.setOnClickListener {
                    removeSuspendedWindow()
                    val uri = AccessibilityHelper.getBrowserUri(root)
                    Log.i(TAG_ACCESSIBILITY, "  =>>>>>> uri $uri")
                    if (uri != null) {
                        startActivity(
                            Constants.getAutoFillIntent(
                                this@VaultAccessibilityService,
                                uri,
                                Constants.ACTION_AUTOFILL_ACCESSIBILITY
                            ).apply {
                                this.flags = Intent.FLAG_ACTIVITY_NEW_TASK or
                                        Intent.FLAG_ACTIVITY_SINGLE_TOP or
                                        Intent.FLAG_ACTIVITY_CLEAR_TOP
                            })
                    }
                }
                val layoutParam = getLayoutParams(rec)
                windowManager.addView(floatRootView, layoutParam)
            }
            val layoutParam = getLayoutParams(rec)
            windowManager.updateViewLayout(floatRootView, layoutParam)
        }
    }

    private fun updateSuspendedWindow(root: AccessibilityNodeInfo, event: AccessibilityEvent) {
        val allViews: MutableList<AccessibilityNodeInfo> =
            AccessibilityHelper.getAllViews(root, event, false) {
                AccessibilityHelper.isEditText(it) && it?.isFocused ?: false
            }
        if (allViews.size > 0) {
            val target = allViews.firstOrNull()
            if (target != null) {
                val rec = Rect()
                target.getBoundsInScreen(rec)
                if (floatRootView != null) {
                    val layoutParam = getLayoutParams(rec)
                    windowManager.updateViewLayout(floatRootView, layoutParam)
                }
            }
        }
    }

    private fun getLayoutParams(rec: Rect): WindowManager.LayoutParams {
        val layoutParam = WindowManager.LayoutParams()
        layoutParam.apply {
            //显示的位置
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                type = WindowManager.LayoutParams.TYPE_ACCESSIBILITY_OVERLAY
                //刘海屏延伸到刘海里面
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                    layoutInDisplayCutoutMode =
                        WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
                }
            } else {
                type = WindowManager.LayoutParams.TYPE_SYSTEM_ALERT
            }
            flags =
                WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE
            width = WindowManager.LayoutParams.WRAP_CONTENT
            height = WindowManager.LayoutParams.WRAP_CONTENT
            format = PixelFormat.TRANSPARENT

            val displayW: Int
            val displayY: Int
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {

                val defaultDisplay =
                    DisplayManagerCompat.getInstance(this@VaultAccessibilityService)
                        .getDisplay(Display.DEFAULT_DISPLAY)
                val displayContext = createDisplayContext(defaultDisplay!!)

                displayW = displayContext.resources.displayMetrics.widthPixels
                displayY = displayContext.resources.displayMetrics.heightPixels

            } else {

                val displayMetrics = DisplayMetrics()
                @Suppress("DEPRECATION")
                windowManager.defaultDisplay.getMetrics(displayMetrics)

                displayW = displayMetrics.heightPixels
                displayY = displayMetrics.widthPixels

            }

            x = -displayW / 2 + rec.left + Utils.dip2px(
                this@VaultAccessibilityService,
                263f
            ) / 2
            y = -displayY / 2 + rec.top + Utils.dip2px(
                this@VaultAccessibilityService,
                54f
            ) / 2
        }
        return layoutParam;
    }

}