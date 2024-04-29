package com.terminus.planeta.plugins

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

/**
 * <pre>
 *     @author : bytetrade
 *     e-mail : zyh2433219116@gmail.com
 *     time   : 2024/03/21
 *     desc   :
 *     version: 1.0
 * </pre>
 */
class IntentReceiver(
    action: String,
    sendListener: OnSendIntentDataListener,
    handleListener: OnHandleIntentListener
) :
    BroadcastReceiver() {

    private var intentAction : String = action;
    private var handleIntentListener: OnHandleIntentListener = handleListener
    private var sendIntentListener: OnSendIntentDataListener = sendListener

    override fun onReceive(context: Context?, intent: Intent?) {
        intent?.let {
            if (intentAction == it.action) {
                sendIntentListener.onSendData(handleIntentListener.onHandleIntent(it))
            }
        }
    }
}