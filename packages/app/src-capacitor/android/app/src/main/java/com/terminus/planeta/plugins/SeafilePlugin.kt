package com.terminus.planeta.plugins

import android.app.Activity.RESULT_OK
import android.content.Intent
import android.net.Uri
import android.util.Log
import androidx.activity.result.ActivityResult
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.ActivityCallback
import com.getcapacitor.annotation.CapacitorPlugin
import com.terminus.planeta.FileActivity
import com.terminus.planeta.R
import com.terminus.planeta.VaultApp
import com.terminus.planeta.file.FileMimeUtils
import com.terminus.planeta.file.NavContext
import com.terminus.planeta.file.Utils
import com.terminus.planeta.file.account.Account
import com.terminus.planeta.file.data.SeafDirent
import com.terminus.planeta.file.ui.TransferActivity
import java.io.File

/**
 * <pre>
 *     @author : bytetrade
 *     e-mail : zyh2433219116@gmail.com
 *     time   : 2023/08/11
 *     desc   :
 *     version: 1.0
 * </pre>
 */
@CapacitorPlugin(name = "SeafilePlugin")
class SeafilePlugin : Plugin() {

    override fun load() {
        super.load()
        val listener : OnTransferListener = object : OnTransferListener{
            override fun onUploadSuccess() {
                notifyListeners("uploadSuccess", JSObject())
            }

            override fun onDownloadSuccess(path: String, fileId: String, local: String) {
                notifyListeners("downloadSuccess", JSObject().apply {
                    this.put("path",path)
                    this.put("fileId",fileId)
                    this.put("local",local)
                })
            }

        }
        (this.activity as FileActivity).setTransferListener(listener)
    }

    @PluginMethod
    fun startTransfer(call: PluginCall) {
        this.activity.startActivity(Intent(this.activity, TransferActivity::class.java))
    }

    @PluginMethod
    fun setUser(call: PluginCall) {
        val server: String? = call.getString("server", "")
        val name: String? = call.getString("name")
        val email: String? = call.getString("email")
//        val sessionKey: String? = call.getString("sessionKey")
//        val isShib: Boolean? = call.getBoolean("is_shib", false)

        val account = if (server.isNullOrEmpty()) {
            val resultServer = Uri.parse(this.bridge.serverUrl)
            Account(
                name,
                this.bridge.serverUrl.replace(resultServer.port.toString(), "8000"),
                email,
                false,
                "",
            )
        } else {
            Account(name, server, email, false, "")
        }
        Log.d("SeafilePlugin", "setUser: " + account.toString())
        VaultApp.application?.setAccount(account = account)

        val data = VaultApp.application?.getDataManager()?.cachedFiles
        Log.d("???", "getCacheFile: $data")
    }

    @PluginMethod
    fun downloadFiles(call: PluginCall) {
        val repoId = call.getString("repoId")
        val repoName = call.getString("repoName")
        val dirPath = call.getString("dirPath")
        val direntJSONArray = call.getArray("dirents");
        val length: Int = direntJSONArray.length()
        val dirents = arrayOfNulls<SeafDirent>(length)

        for (i in 0 until length) {
            dirents[i] = SeafDirent.fromJson(direntJSONArray.getJSONObject(i))
        }
//        (this.activity as FileActivity).downloadFiles(repoId, repoName, dirPath,dirents.toMutableList())
    }

    @PluginMethod
    fun downloadFile(call: PluginCall) {
        val repoId = call.getString("repoId")
        val repoName = call.getString("repoName")
        val dirPath = call.getString("dirPath")
        val fileName = call.getString("fileName")
        (this.activity as FileActivity).downloadFile(repoName, repoId, dirPath, fileName)
    }

    @PluginMethod
    fun uploadFile(call: PluginCall) {
        val target = Utils.createGetContentIntent()
        val intent = Intent.createChooser(target, this.activity.getString(R.string.choose_file))
        startActivityForResult(call, intent, "pickFileUpload")
    }

    @ActivityCallback
    fun pickFileUpload(call: PluginCall, result: ActivityResult) {
        val names = call.getArray("names")
        val repoId = call.getString("repoId")
        val repoName = call.getString("repoName")
        val dirPath = call.getString("dirPath")
        val dirID = call.getString("dirID")
        val dirPermission = call.getString("dirPermission")
        Log.d(
            "???",
            "pickFileUpload: name ${names.toList<String>()} repoId $repoId repoName $repoName dirPath $dirPath dirID $dirID dirPermission $dirPermission"
        )
        (this.activity as FileActivity).setNavContext(
            NavContext(
                repoId,
                repoName,
                dirPath,
                dirID,
                dirPermission
            )
        )
        if (result.resultCode == RESULT_OK) {
            (this.activity as FileActivity).uploadFile(result)
            return
        }
        (this.activity as FileActivity).showShortToast(
            this.activity,
            this.activity.getString(R.string.saf_upload_path_not_available)
        )
    }

    @PluginMethod
    fun getCacheFile(call: PluginCall) {
        val repoId = call.getString("repoId")
        val repoName = call.getString("repoName")
        val fileID = call.getString("fileID")
        val path = call.getString("path")
        val localFile = VaultApp.application?.getDataManager()?.getLocalCachedFile(repoName,repoId,path,fileID)
        val jsObject = JSObject()
        var fileUri = "";
        var fileMime = "";
        if (localFile != null){
            fileUri = "file://" + localFile.absolutePath
            fileMime = FileMimeUtils.getMimeType(localFile)
            Log.d("???", "fileMime $fileMime getCacheFile: $fileUri")
        }
        call.resolve(jsObject.put("path", fileUri))
    }

    @PluginMethod
    fun openLocalFile(call : PluginCall){
        val repoId = call.getString("repoId")
        val repoName = call.getString("repoName")
        val fileID = call.getString("fileID")
        val path = call.getString("path")
        val dataManager = VaultApp.application?.getDataManager()
//        val repo: SeafRepo? = dataManager?.getCachedRepoByID(repoId)
//        // Encrypted repo doesn\`t support gallery,
//        // because pic thumbnail under encrypted repo was not supported at the server side
//        if (Utils.isViewableImage(fileName) && repo != null && !repo.encrypted) {
//            WidgetUtils.startGalleryActivity(this, repoName, repoID, dirPath, fileName, account)
//            return
//        }
        val localFile: File? = dataManager?.getLocalCachedFile(repoName, repoId, path,fileID)
        if (localFile != null) {
            WidgetUtils.showFileProvider(this.activity, localFile)
            call.resolve()
        }else{
            call.reject("file not exist")
        }
    }
}