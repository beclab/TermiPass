package com.terminus.planeta

import android.app.Application
import com.tencent.mmkv.MMKV
import com.terminus.planeta.file.account.Account
import com.terminus.planeta.file.data.DataManager
import com.terminus.planeta.utils.ExitUtils

/**
 * <pre>
 *     @author : bytetrade
 *     e-mail : zyh2433219116@gmail.com
 *     time   : 2023/02/09
 *     desc   :
 *     version: 1.0
 * </pre>
 */
open class VaultApp : Application() {

    var scaleServer : String = ""
    var authKey : String = ""
    var cookies : String = ""
    var exitUtils : ExitUtils? = null

    private var waitingNumber = 0
    private var totalNumber = 0
    private var scanUploadStatus = 0
    private var totalBackup = 0
    private var waitingBackup = 0
    private var account : Account ? = null
    private var dataManager : DataManager ?= null

    companion object{
        var application : VaultApp? = null
    }

    override fun onCreate() {
        super.onCreate()
        MMKV.initialize(this@VaultApp)
        application = this
        exitUtils = ExitUtils(application);
    }

    fun setCameraUploadNumber(waitingNumber: Int, totalNumber: Int) {
        this.waitingNumber = waitingNumber
        this.totalNumber = totalNumber
    }

    fun setScanUploadStatus(scanUploadStatus: Int) {
        this.scanUploadStatus = scanUploadStatus
    }

    fun getScanUploadStatus(): Int {
        return scanUploadStatus
    }

    fun setFolderBackupNumber(totalBackup: Int, waitingBackup: Int) {
        this.totalBackup = totalBackup
        this.waitingBackup = waitingBackup
    }

    fun getWaitingNumber(): Int {
        return waitingNumber
    }

    fun getTotalNumber(): Int {
        return totalNumber
    }

    fun setAccount(account: Account){
        this.account = account
//        CertsManager.instance().saveCertForAccount(this.account, true)
        this.dataManager = DataManager(account)
    }

    fun getAccount() : Account? {
        return this.account;
    }

    fun getDataManager() : DataManager? {
        return this.dataManager;
    }
}