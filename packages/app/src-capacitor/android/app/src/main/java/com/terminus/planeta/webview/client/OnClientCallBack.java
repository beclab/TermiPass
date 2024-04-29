package com.terminus.planeta.webview.client;

import android.graphics.Bitmap;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
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
public interface OnClientCallBack {

    void onPageStarted(WebView view, String url, Bitmap favicon);

    void onPageFinished(WebView view, String url);

    void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error);
}
