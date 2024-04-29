package com.terminus.planeta.autofill

import android.os.Build
import android.service.autofill.Dataset
import android.util.Log
import android.widget.RemoteViews
import androidx.annotation.RequiresApi
import com.terminus.planeta.accessibility.AppCredential
import com.terminus.planeta.utils.Constants


/**
 * <pre>
 *     @author : bytetrade
 *     e-mail : zyh2433219116@gmail.com
 *     time   : 2023/02/14
 *     desc   : 插件调用 创建一个对象 需要自填的 账号密码
 *     version: 1.0
 * </pre>
 */
@RequiresApi(Build.VERSION_CODES.O)
class AutofillAppCredential(
    url: String?,
    userName: String?,
    password: String?
) : AppCredential(url, userName, password) {


    /**
     * 对字段拆解赋值（可以构建多种类型 当前只支持账户密码）
     */
    fun applyToFields(
        builder: Dataset.Builder,
        fieldCollection: FieldCollection
    ): Boolean {
        Log.i(Constants.TAG_FRAMEWORK,this.toString())
        var nameSet = false
        var pwdSet = false
        val remoteViews: RemoteViews =
            RemoteViewHelper.viewsWithAuth(
                Constants.VAULT_PACKAGE_NAME,
                url ?: "url",
                userName ?: "name"
            )
        if (password != null) {
            fieldCollection.getPasswordFields()?.forEach {
                Log.i(Constants.TAG_FRAMEWORK,"password $it")
                val value = it.getAutofillValue(password)
                if (value != null && it.autofillId != null) {
                    builder.setValue(it.autofillId, value, remoteViews)
                    pwdSet = true
                }
            }
        }
        if (userName != null) {
            fieldCollection.getUsernameFields()?.forEach {
                Log.i(Constants.TAG_FRAMEWORK,"userName $it")
                val value = it.getAutofillValue(userName)
                if (value != null && it.autofillId != null) {
                    builder.setValue(it.autofillId, value, remoteViews)
                    nameSet = true
                }
            }
        }
        Log.i(Constants.TAG_FRAMEWORK, "applyToFields: pwdSet $pwdSet nameSet $nameSet")
        return pwdSet || nameSet
    }


    /**
     * 按照字段hint对某一个字段赋值
     */
    private fun applyValue(
        builder: Dataset.Builder,
        fieldCollection: FieldCollection,
        value: String,
        hint: String
    ): Boolean {
        var setValues = false
        if (fieldCollection.fieldHintMap.containsKey(hint) && value.isNotBlank()) {
            for (field in fieldCollection.fieldHintMap[hint]!!) {
                val autofillValue = field.getAutofillValue(value)
                //解锁状态把已经添加过的数据 转化为view 供下一次直接选取
                val remoteViews: RemoteViews =
                    RemoteViewHelper.viewsWithAuth(
                        Constants.VAULT_PACKAGE_NAME,
                        url ?: "url",
                        userName ?: "name"
                    )
                if (autofillValue != null) {
                    builder.setValue(field.autofillId!!, autofillValue, remoteViews)
                    setValues = true
                }
            }
        }
        return setValues;
    }
}