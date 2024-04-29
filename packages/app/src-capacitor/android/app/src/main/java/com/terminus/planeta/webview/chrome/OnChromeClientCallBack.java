package com.terminus.planeta.webview.chrome;

import android.webkit.WebView;

/**
 * <pre>
 *     @author : zhangyuhang
 *     e-mail : zyh2433219116@gmail.com
 *     time   : 2021/05/10
 *     desc   :
 *     version: 1.0
 * </pre>
 */
public interface OnChromeClientCallBack {

    void onReceivedTitle(WebView view, String title);

    void onProgressChanged(WebView view, int newProgress);
}
