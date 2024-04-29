package com.terminus.planeta.autofill

import android.app.Activity
import android.app.Activity.RESULT_OK
import android.app.assist.AssistStructure
import android.content.Context
import android.content.Intent
import android.content.IntentSender
import android.os.Build
import android.service.autofill.Dataset
import android.service.autofill.FillResponse
import android.util.Log
import android.view.autofill.AutofillManager
import android.view.autofill.AutofillValue
import android.widget.RemoteViews
import androidx.annotation.RequiresApi
import androidx.appcompat.app.AppCompatActivity
import com.terminus.planeta.utils.Constants
import com.terminus.planeta.utils.Constants.TAG_FRAMEWORK

/**
 * <pre>
 *     @author : bytetrade
 *     e-mail : zyh2433219116@gmail.com
 *     time   : 2023/02/14
 *     desc   :
 *     请求验证 和 数据设置 包含Dataset 和 FillResponse2种
 *     Dataset 和 FillResponse 区别就是直接设置 和 选择设置，使用时注意
 *          1. 身份验证的时候不要调用FillResponse的setAuthentication()方法，而是调用Dataset的setAuthentication()方法。
 *          2. 在验证OK的时候，通过AutofillManager.EXTRA_AUTHENTICATION_RESULT传递结果的时候，不要传递FillResponse，而是传递Dataset对象
 *     version: 1.0
 * </pre>
 */
@RequiresApi(Build.VERSION_CODES.O)
object DataSetAdapter {

    fun startDatasetAuthentication(
        parser: StructureParser,
        context: Context
    ): FillResponse.Builder {
        //当前未解锁 使用锁定view
        val remoteViews: RemoteViews =
            RemoteViewHelper.viewsWithNoAuth(Constants.VAULT_PACKAGE_NAME)
        val overlayIntentSender: IntentSender =
            AutofillHelper.getManualIntentSenderForResponse(parser.getUri(), context)
        val builder = Dataset.Builder(remoteViews)
        for (filed in parser.getCollection().fieldList) {
            //noAuth 也需要设置value
            builder.setValue(filed.autofillId!!, AutofillValue.forText("PLACEHOLDER"))
        }
        builder.setAuthentication(overlayIntentSender)
        return FillResponse.Builder()
            .addDataset(builder.build())
            .setIgnoredIds(*parser.getCollection().ignoreAutoIdList.toTypedArray())
    }


    fun startFillResponseAuthentication(
        parser: StructureParser,
        context: Context
    ): FillResponse.Builder {
        val remoteViews: RemoteViews =
            RemoteViewHelper.viewsWithNoAuth(Constants.VAULT_PACKAGE_NAME)
        val overlayIntentSender: IntentSender =
            AutofillHelper.getManualIntentSenderForResponse(parser.getUri(), context)
        return FillResponse.Builder()
            .setAuthentication(
                parser.getCollection().getFieldAutofillIds().toTypedArray(),
                overlayIntentSender,
                remoteViews
            )
            .setIgnoredIds(*parser.getCollection().ignoreAutoIdList.toTypedArray())
    }

    /**
     * 直接把账号的数据写入界面
     */
    fun setDateSetResult(
        structure: AssistStructure,
        appCredential: AutofillAppCredential,
        activity: Activity
    ): Boolean {
        val builder = Dataset.Builder()
        val parser = StructureParser(structure)
        parser.parse(null)
        val apply = appCredential.applyToFields(builder, parser.getCollection())

        if (apply) {
            val replyIntent = Intent()
            replyIntent.putExtra(AutofillManager.EXTRA_AUTHENTICATION_RESULT, builder.build());
            activity.setResult(RESULT_OK, replyIntent)
        }
        return apply
    }

    /**
     * 需要再次点击一次RemoteView，之后把新建数据写入界面
     */
    fun setFillResponseResult(
        structure: AssistStructure,
        appCredential: AutofillAppCredential,
        activity: Activity
    ): Boolean {
        val parser = StructureParser(structure)
        parser.parse(null)

        val remoteViews: RemoteViews =
            RemoteViewHelper.viewsWithNoAuth(Constants.VAULT_PACKAGE_NAME)
        val overlayIntentSender: IntentSender =
            AutofillHelper.getManualIntentSenderForResponse(parser.getUri(), activity as Context)
        val authBuilder = Dataset.Builder(remoteViews)
        for (filed in parser.getCollection().fieldList) {
            //noAuth 也需要设置value
            authBuilder.setValue(filed.autofillId!!, AutofillValue.forText("PLACEHOLDER"))
        }
        authBuilder.setAuthentication(overlayIntentSender)

        val dataBuilder = Dataset.Builder()
        val apply = appCredential.applyToFields(dataBuilder, parser.getCollection())
        Log.i(TAG_FRAMEWORK, "$apply")

        if (apply) {
            val replyIntent = Intent()
            val fillResponse: FillResponse = FillResponse.Builder()
                .addDataset(dataBuilder.build())
                .addDataset(authBuilder.build())
                .setIgnoredIds(*parser.getCollection().ignoreAutoIdList.toTypedArray())
                .build()
            replyIntent.putExtra(AutofillManager.EXTRA_AUTHENTICATION_RESULT, fillResponse);
            activity.setResult(AppCompatActivity.RESULT_OK, replyIntent)
        }
        return apply
    }
}