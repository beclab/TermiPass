package com.terminus.planeta.plugins;

import android.app.Activity;
import android.content.Intent;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

import androidx.activity.result.ActivityResult;

/**
 * <pre>
 *     @author : bytetrade
 *     e-mail : zyh2433219116@gmail.com
 *     time   : 2023/01/05
 *     desc   :
 *     version: 1.0
 * </pre>
 */
@CapacitorPlugin(name = "TwitterLogin")
public class TwitterLoginPlugin extends Plugin {

    private static final String TAG = ScanPhotoQRPlugin.class.getSimpleName();

    @PluginMethod
    public void login(PluginCall call) {
        String oauthUrl = call.getString("oauthUrl", "");
        Intent intent = new Intent(getActivity(), Oauth2Activity.class);
        intent.putExtra("oauthUrl", oauthUrl);
        startActivityForResult(call, intent, "handleOauthResult");
    }

    @ActivityCallback
    private void handleOauthResult(PluginCall call, ActivityResult result) {
        Log.d(TAG, "handleOauthResult: " + result.getResultCode());
        if (result.getResultCode() == Activity.RESULT_OK && result.getData() != null) {
            boolean status = result.getData().getBooleanExtra("status", false);
            String message = result.getData().getStringExtra("message");
            JSObject jsObject = new JSObject();
            jsObject.put("status", status);
            jsObject.put("message", message.isEmpty() ?  "oauth result error" : message);
            call.resolve(jsObject);
        } else {
            JSObject jsObject = new JSObject();
            jsObject.put("status", false);
            jsObject.put("message", "oauth result error");
            call.resolve(jsObject);
        }
    }

}
