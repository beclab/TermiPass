package com.terminus.planeta.plugins;

import androidx.appcompat.app.AppCompatActivity;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.widget.Toast;

import com.terminus.planeta.R;
import com.terminus.planeta.utils.Constants;
import com.terminus.planeta.view.BaseWebView;
import com.terminus.planeta.view.TitleBar;
import com.terminus.planeta.view.WebProgress;
import com.terminus.planeta.webview.chrome.OnChromeClientCallBack;
import com.terminus.planeta.webview.client.OnClientCallBack;
import com.terminus.planeta.webview.settings.DefaultSettings;


public class Oauth2Activity extends AppCompatActivity implements OnChromeClientCallBack, OnClientCallBack {

    private static final String TAG = Oauth2Activity.class.getSimpleName();

    private TitleBar mTitleBar;
    private WebProgress mProgress;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_oauth2);

        mTitleBar = findViewById(R.id.oauth_title_bar);
        mProgress = findViewById(R.id.oauth_progress);

        BaseWebView webView = findViewById(R.id.oauth_web_view);

        mTitleBar.setOnTitleBarClickListener(new TitleBar.OnTitleBarClickListener() {
            @Override
            public void onLeftClick(View v) {
                setResult(Activity.RESULT_CANCELED, new Intent());
                finish();
            }

            @Override
            public void onTitleClick(View v) {
                //Do Nothing
            }

            @Override
            public void onRightClick(View v) {
                //Do Nothing
            }
        });

        webView.registerChromeCallBack(this);
        webView.registerClientCallBack(this);

        String oauthUrl = getIntent().getStringExtra("oauthUrl");
        if (!"".equals(oauthUrl)) {
            webView.loadUrl(oauthUrl);
            mProgress.show();
        }

        Constants.registerStatusBar(this);
    }

    @Override
    public void onReceivedTitle(WebView view, String title) {
        mTitleBar.setTitle(title);
    }

    @Override
    public void onProgressChanged(WebView view, int newProgress) {
        mProgress.setWebProgress(newProgress);
    }

    @Override
    public void onPageStarted(WebView view, String url, Bitmap favicon) {
        Log.d(TAG, "onPageStarted: " + url);
        Intent intent = new Intent();
        if (url.contains("twitter_result")){
            try {
                Uri uri = Uri.parse(url);
                String message = uri.getQueryParameter("message");
                Log.d(TAG, "onPageStarted: " + message);
                if (message == null || message.isEmpty()){
                    intent.putExtra("status", false);
                    setResult(Activity.RESULT_CANCELED, intent);
                    finish();
                    return;
                }
                intent.putExtra("status", true);
                intent.putExtra("message", message);
                setResult(Activity.RESULT_OK, intent);
                finish();
            }catch (Exception e){
                intent.putExtra("status", false);
                intent.putExtra("message", e.getMessage());
                setResult(Activity.RESULT_CANCELED, intent);
                finish();
            }

        }
    }

    @Override
    public void onPageFinished(WebView view, String url) {
        // html加载完成之后，无网隐藏进度条
        if (!DefaultSettings.isNetConnected(this)) {
            mProgress.hide();
        }
    }

    @Override
    public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
            Toast.makeText(this, error.getDescription(), Toast.LENGTH_SHORT).show();
        } else {
            Toast.makeText(this, "Received Error", Toast.LENGTH_SHORT).show();
        }
    }
}
