package com.terminus.planeta.webview.chrome;

import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;
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
public class DefaultChromeClient extends WebChromeClient {

    private OnChromeClientCallBack mOnChromeClientCallBack;

    public DefaultChromeClient(OnChromeClientCallBack onChromeClientCallBack) {
        this.mOnChromeClientCallBack = onChromeClientCallBack;
    }

    @Override
    public void onReceivedTitle(WebView view, String title) {
        super.onReceivedTitle(view, title);
        mOnChromeClientCallBack.onReceivedTitle(view, title);
    }

    @Override
    public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
        return super.onConsoleMessage(consoleMessage);
    }

    @Override
    public void onProgressChanged(WebView view, int newProgress) {
        super.onProgressChanged(view, newProgress);
        mOnChromeClientCallBack.onProgressChanged(view, newProgress);
    }
}
