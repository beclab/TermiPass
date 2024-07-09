package com.terminus.planeta.plugins

/**
 * <pre>
 *     @author : bytetrade
 *     e-mail : zyh2433219116@gmail.com
 *     time   : 2024/06/20
 *     desc   :
 *     version: 1.0
 * </pre>
 */
class DropboxAppConfig(val apiKey : String) {
    val clientIdentifier: String = "db-${apiKey}"
}