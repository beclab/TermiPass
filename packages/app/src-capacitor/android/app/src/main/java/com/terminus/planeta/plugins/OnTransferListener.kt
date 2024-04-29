package com.terminus.planeta.plugins

/**
 * <pre>
 *     @author : bytetrade
 *     e-mail : zyh2433219116@gmail.com
 *     time   : 2023/08/16
 *     desc   :
 *     version: 1.0
 * </pre>
 */
interface OnTransferListener {
    fun onUploadSuccess()
    fun onDownloadSuccess(path : String,fileId : String,local : String)
}