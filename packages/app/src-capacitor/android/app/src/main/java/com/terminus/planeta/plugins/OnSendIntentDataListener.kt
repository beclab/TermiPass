package com.terminus.planeta.plugins

import com.getcapacitor.JSObject

/**
 * <pre>
 *     @author : bytetrade
 *     e-mail : zyh2433219116@gmail.com
 *     time   : 2024/03/21
 *     desc   :
 *     version: 1.0
 * </pre>
 */
interface OnSendIntentDataListener {
    fun onSendData(json : JSObject)
}