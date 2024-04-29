package com.terminus.planeta.webview.client;

import android.graphics.Bitmap;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/**
 * <pre>
 *     @author : zhangyuhang
 *     e-mail : zyh2433219116@gmail.com
 *     time   : 2021/05/10
 *     desc   :
 *     version: 1.0
 * </pre>
 */
public class DefaultClient extends WebViewClient {

    private OnClientCallBack mOnClientCallBack;

    public DefaultClient(OnClientCallBack onClientCallBack) {
        this.mOnClientCallBack = onClientCallBack;
    }

    @Override
    public void onPageStarted(WebView view, String url, Bitmap favicon) {
        super.onPageStarted(view, url, favicon);
        mOnClientCallBack.onPageStarted(view, url, favicon);
    }

    @Override
    public void onPageFinished(WebView view, String url) {
        super.onPageFinished(view, url);
        mOnClientCallBack.onPageFinished(view, url);
    }

    @Override
    public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
        super.onReceivedError(view, request, error);
        mOnClientCallBack.onReceivedError(view, request, error);
    }
}
