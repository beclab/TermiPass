package com.terminus.planeta.accessibility

/**
 * <pre>
 * @author : bytetrade
 * e-mail : zyh2433219116@gmail.com
 * time   : 2023/02/06
 * desc   :
 * version: 1.0
</pre> *
 */
open class Browser(private val packageName: String, private val uriViewId: String) :
    BrowserAdapter {

    fun packageName(): String {
        return packageName
    }

    fun uriViewId(): String {
        return uriViewId
    }

    override fun getUriFunction(uri: String): String {
        return uri
    }
}

interface BrowserAdapter {
    fun getUriFunction(uri: String): String
}