package com.terminus.planeta.view;

import android.content.Context;
import android.util.AttributeSet;
import android.webkit.WebView;

import com.terminus.planeta.webview.chrome.DefaultChromeClient;
import com.terminus.planeta.webview.chrome.OnChromeClientCallBack;
import com.terminus.planeta.webview.client.DefaultClient;
import com.terminus.planeta.webview.client.OnClientCallBack;
import com.terminus.planeta.webview.settings.DefaultSettings;


/**
 * <pre>
 *     @author : bytetrade
 *     e-mail : zyh2433219116@gmail.com
 *     time   : 2023/01/06
 *     desc   :
 *     version: 1.0
 * </pre>
 */
public class BaseWebView extends WebView {

    public BaseWebView(Context context) {
        super(context);
        init();
    }

    public BaseWebView(Context context, AttributeSet attrs) {
        super(context, attrs);
        init();
    }

    public BaseWebView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init();
    }

    public BaseWebView(Context context, AttributeSet attrs, int defStyleAttr, int defStyleRes) {
        super(context, attrs, defStyleAttr, defStyleRes);
        init();
    }

    private void init(){
        DefaultSettings.getInstance().setSettings(this);
    }

    public void registerClientCallBack(OnClientCallBack onClientCallBack) {
        setWebViewClient(new DefaultClient(onClientCallBack));
    }

    public void registerChromeCallBack(OnChromeClientCallBack onChromeClientCallBack) {
        setWebChromeClient(new DefaultChromeClient(onChromeClientCallBack));
    }

}

