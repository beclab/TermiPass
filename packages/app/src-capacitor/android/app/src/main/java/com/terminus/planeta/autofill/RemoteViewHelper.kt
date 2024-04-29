package com.terminus.planeta.autofill

import android.widget.RemoteViews
import com.terminus.planeta.R

/**
 * <pre>
 * @author : bytetrade
 * e-mail : zyh2433219116@gmail.com
 * time   : 2023/02/14
 * desc   : 自动填入UI 未解锁和解锁2种
 * version: 1.0
</pre> *
 */
object RemoteViewHelper {

    fun viewsWithAuth(packageName: String, url: String, username: String): RemoteViews {
        val presentation = RemoteViews(packageName, R.layout.item_autofill_framework)
        presentation.setTextViewText(R.id.text_label ,url)
        presentation.setTextViewText(R.id.text_action, username)
        presentation.setImageViewResource(R.id.icon, R.drawable.ic_autofill_unlock)
        return presentation
    }

    fun viewsWithNoAuth(packageName: String): RemoteViews {
        val presentation = RemoteViews(packageName, R.layout.item_autofill_framework)
        presentation.setImageViewResource(R.id.icon, R.mipmap.ic_launcher_round)
        return presentation
    }
}