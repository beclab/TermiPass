package com.terminus.planeta.webview.settings;

import android.content.Context;
import android.net.ConnectivityManager;
import android.net.Network;
import android.net.NetworkCapabilities;
import android.net.NetworkInfo;
import android.os.Build;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.terminus.planeta.BuildConfig;

/**
 * <pre>
 *     @author : zhangyuhang
 *     e-mail : zyh2433219116@gmail.com
 *     time   : 2021/05/10
 *     desc   :
 *     version: 1.0
 * </pre>
 */
public class DefaultSettings {

    private DefaultSettings() {
    }

    public static DefaultSettings getInstance() {
        return new DefaultSettings();
    }

    public static boolean isNetConnected(Context context) {
        ConnectivityManager connectivityManager = (ConnectivityManager) context.getSystemService(Context.CONNECTIVITY_SERVICE);
        if (connectivityManager == null) {
            return false;
        }

        //api23出了新的检测网络方式
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            Network network = connectivityManager.getActiveNetwork();
            NetworkCapabilities capabilities = connectivityManager.getNetworkCapabilities(network);
            return capabilities != null && capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET);
        } else {
            //api29弃用
            NetworkInfo networkInfo = connectivityManager.getActiveNetworkInfo();
            return networkInfo != null && networkInfo.isConnected();
        }
    }

    public void setSettings(WebView webView) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            WebView.enableSlowWholeDocumentDraw();
        }
        WebSettings mWebSettings = webView.getSettings();
        //设置WebView是否允许执行JavaScript脚本，默认false，不允许
        mWebSettings.setJavaScriptEnabled(true);
        //支持缩放
        mWebSettings.setSupportZoom(true);
        //显示缩放图标
        mWebSettings.setBuiltInZoomControls(false);
        //设置缓存策略
        //重写使用缓存的方式，默认值LOAD_DEFAULT。
        // 缓存的使用方式基于导航类型，正常的页面加载，检测缓存，需要时缓存内容复现。
        // 导航返回时，内容不会复现，只有内容会从缓存盘中恢复。
        // 该方法允许客户端通过指定LOAD_DEFAULT, LOAD_CACHE_ELSE_NETWORK, LOAD_NO_CACHE or LOAD_CACHE_ONLY的其中一项来重写其行为。
        if (isNetConnected(webView.getContext())) {
            mWebSettings.setCacheMode(WebSettings.LOAD_DEFAULT);
        } else {
            mWebSettings.setCacheMode(WebSettings.LOAD_CACHE_ELSE_NETWORK);
        }
        //是否支持http https混用
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            mWebSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        }

        //硬件加速器 兼容性问题较多
        //if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP){
        //    webView.setLayerType(View.LAYER_TYPE_HARDWARE,null);
        //}else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT){
        //    webView.setLayerType(View.LAYER_TYPE_HARDWARE,null);
        //}else if (Build.VERSION.SDK_INT < Build.VERSION_CODES.KITKAT){
        //    webView.setLayerType(View.LAYER_TYPE_SOFTWARE,null);
        //}
        //缩放级别
        mWebSettings.setTextZoom(100);
        //是否使用数据库
        mWebSettings.setDatabaseEnabled(true);
        //WebView是否下载图片资源，默认为true。
        mWebSettings.setLoadsImagesAutomatically(true);
        //允许使用网络URI的图片下载
        mWebSettings.setBlockNetworkImage(false);
        //设置WebView是否支持多窗口。如果设置为true，主程序要实现onCreateWindow(WebView, boolean, boolean, Message)，默认false。
        mWebSettings.setSupportMultipleWindows(false);
        //是否允许访问文件，默认允许。注意，这里只是允许或禁止对文件系统的访问，Assets 和 resources 文件使用
        // file:///android_asset 和 file:///android_res仍是可访问的。
        mWebSettings.setAllowFileAccess(true);
        //
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN) {
            //是否允许运行在一个URL环境（the context of a file scheme URL）中的JavaScript访问来自其他URL环境的内容，为了保证安全，应该不允许。
            // 也请注意，这项设置只影响对file schema 资源的JavaScript访问，其他形式的访问，例如来自图片HTML单元的访问不受影响。
            // 为了防止相同的域策略（same domain policy）对ICE_CREAM_SANDWICH以及更老机型的侵害，应该显式地设置此值为false。
            mWebSettings.setAllowFileAccessFromFileURLs(false);
            //是否允许运行在一个file schema URL环境下的JavaScript访问来自其他任何来源的内容，包括其他file schema URLs.
            // 参见setAllowFileAccessFromFileURLs(boolean)，为了确保安全，应该设置为不允许，
            // 注意这项设置只影响对file schema 资源的JavaScript访问，其他形式的访问，例如来自图片HTML单元的访问不受影响。
            // 为了防止相同的域策略（same domain policy）对ICE_CREAM_SANDWICH以及更老机型的侵害，应该显式地设置此值为false。
            // ICE_CREAM_SANDWICH_MR1 以及更老的版本此默认值为true，JELLY_BEAN以及更新版本此默认值为false
            mWebSettings.setAllowUniversalAccessFromFileURLs(false);
        }
        //允许JavaScript自动打开窗口，默认false。适用于JavaScript方法window.open()
        mWebSettings.setJavaScriptCanOpenWindowsAutomatically(true);
        //if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
        //    mWebSettings.setLayoutAlgorithm(WebSettings.LayoutAlgorithm.SINGLE_COLUMN);
        //} else {
        //    mWebSettings.setLayoutAlgorithm(WebSettings.LayoutAlgorithm.NORMAL);
        //}
        //API18以上版本已废弃。未来版本将不支持保存WebView中的密码。设置WebView是否保存密码，默认true
        //mWebSettings.setSavePassword(false);
        //WebView是否保存表单数据，默认值true。废弃，旧版本可用
        mWebSettings.setSaveFormData(false);
        //是否允许WebView度超出以概览的方式载入页面，默认false。
        mWebSettings.setLoadWithOverviewMode(true);
        //WebView是否支持HTML的“viewport”标签或者使用wide viewport。
        // 设置值为true时，布局的宽度总是与WebView控件上的设备无关像素（device-dependent pixels）宽度一致。
        // 当值为true且页面包含viewport标记，将使用标签指定的宽度。如果页面不包含标签或者标签没有提供宽度，那就使用wide viewport。
        mWebSettings.setUseWideViewPort(true);
        //DOM存储API是否可用，默认false。
        mWebSettings.setDomStorageEnabled(true);
        //调用requestFocus(int, android.graphics.Rect)时是否需要设置节点获取焦点，默认值为true。
        mWebSettings.setNeedInitialFocus(true);
        //设置编码格式
        mWebSettings.setDefaultTextEncodingName("utf-8");
        //设置默认字体
        mWebSettings.setDefaultFontSize(16);
        //设置最小支持字体大小，默认为8
        mWebSettings.setMinimumFontSize(10);
        //定位是否可用，默认为true。
        //请注意，为了确保定位API在WebView的页面中可用，必须遵守如下约定:
        //(1) app必须有定位的权限，参见ACCESS_COARSE_LOCATION, ACCESS_FINE_LOCATION；
        //(2) app必须提供onGeolocationPermissionsShowPrompt(String, GeolocationPermissions.Callback)回调方法的实现，在页面通过JavaScript定位API请求定位时接收通知。
        //作为可选项，可以在数据库中存储历史位置和Web初始权限，参见setGeolocationDatabasePath(String).
        mWebSettings.setGeolocationEnabled(true);

        String appCacheDir = webView.getContext().getDir("cache", Context.MODE_PRIVATE).getPath();
        mWebSettings.setDatabasePath(appCacheDir);

        //用户可以自己设置useragent
        //mWebSettings.setUserAgentString("webprogress/build you agent info");

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG);
        }
    }

}
