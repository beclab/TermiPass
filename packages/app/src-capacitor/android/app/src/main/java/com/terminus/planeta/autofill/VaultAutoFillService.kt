package com.terminus.planeta.autofill

import android.os.Build
import android.os.CancellationSignal
import android.service.autofill.*
import android.util.Log
import android.widget.Toast
import androidx.annotation.RequiresApi
import com.terminus.planeta.autofill.AutofillHelper.getAutoFillSavePendingIntent
import com.terminus.planeta.utils.Constants.TAG_FRAMEWORK

@RequiresApi(Build.VERSION_CODES.O)
class VaultAutoFillService : AutofillService() {

    override fun onFillRequest(
        request: FillRequest,
        cancellationSignal: CancellationSignal,
        callback: FillCallback
    ) {

        val structure = request.fillContexts.lastOrNull()?.structure ?: return
        val parser = StructureParser(structure)
        parser.parse(null)
        Log.i(
            TAG_FRAMEWORK,
            "onFillRequest: collection hintsMap ${parser.getCollection().fieldHintMap}"
        )
        Log.i(TAG_FRAMEWORK, "onFillRequest: collection fieldList ===>")
        parser.getCollection().fieldList.forEach {
            Log.i(TAG_FRAMEWORK, "onFillRequest: collection field $it")
        }
        Log.i(TAG_FRAMEWORK, "onFillRequest: collection fieldList <===")

        Log.i(TAG_FRAMEWORK, "onFillRequest: uri ${parser.getUri()}")
        Log.i(TAG_FRAMEWORK, "onFillRequest: fillable ${parser.getCollection().fillable()}")
        Log.i(TAG_FRAMEWORK, "onFillRequest: blackUri ${AutofillHelper.blacklistedUris.contains(parser.getUri())}")
        if (parser.getUri().isNullOrBlank() ||
            !parser.getCollection().fillable() ||
            AutofillHelper.blacklistedUris.contains(parser.getUri())
        ) {
            Log.i(TAG_FRAMEWORK, "onFillRequest: not support fill")
            return
        }

        val fillResponseBuilder =
            DataSetAdapter.startDatasetAuthentication(parser, this@VaultAutoFillService)
        AutofillHelper.addSaveInfo(parser, request, fillResponseBuilder)

        callback.onSuccess(fillResponseBuilder.build())
    }

    @RequiresApi(Build.VERSION_CODES.P)
    override fun onSaveRequest(request: SaveRequest, callback: SaveCallback) {

        val structure = request.fillContexts.lastOrNull()?.structure ?: return
        val parser = StructureParser(structure)
        parser.parse(null)

        val saveData = parser.getCollection().getSavedData()
        if (saveData == null) {
            Toast.makeText(this, "Unable to save this credential.", Toast.LENGTH_SHORT).show()
            return
        }
        Log.i(TAG_FRAMEWORK, "onSaveRequest: saveData opt ${saveData.data.opt()}")

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            callback.onSuccess(
                getAutoFillSavePendingIntent(
                    this,
                    parser.getUri(),
                    saveData.type,
                    saveData.data.opt()
                ).intentSender
            )
        }else {
            val pendingIntent = getAutoFillSavePendingIntent(
                this,
                parser.getUri(),
                saveData.type,
                saveData.data.opt(),
                true
            )
            pendingIntent.send()
            callback.onSuccess()
        }
    }
}