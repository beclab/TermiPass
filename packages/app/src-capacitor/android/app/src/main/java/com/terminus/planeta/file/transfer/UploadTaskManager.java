package com.terminus.planeta.file.transfer;

import android.content.Intent;

import com.terminus.planeta.VaultApp;
import com.terminus.planeta.file.account.Account;
import com.terminus.planeta.file.notification.UploadNotificationProvider;

import java.util.ArrayList;
import java.util.List;

import androidx.localbroadcastmanager.content.LocalBroadcastManager;

/**
 * Upload task manager
 * <p/>
 */
public class UploadTaskManager extends TransferManager implements UploadStateListener {
    private static final String DEBUG_TAG = "UploadTaskManager";

    public static final String BROADCAST_FILE_UPLOAD_SUCCESS = "uploaded";
    public static final String BROADCAST_FILE_UPLOAD_FAILED = "uploadFailed";
    public static final String BROADCAST_FILE_UPLOAD_PROGRESS = "uploadProgress";
    public static final String BROADCAST_FILE_UPLOAD_CANCELLED = "uploadCancelled";

    private static UploadNotificationProvider mNotifyProvider;


    public int addTaskToQue(String source, Account account, String repoID, String repoName, String dir, String filePath, boolean isUpdate, boolean isCopyToLocal, boolean byBlock) {
        if (repoID == null || repoName == null)
            return 0;

        // create a new one to avoid IllegalStateException
        UploadTask task = new UploadTask(source, ++notificationID, account, repoID, repoName, dir, filePath, isUpdate, isCopyToLocal, byBlock, this);
        addTaskToQue(task);
        return task.getTaskID();
    }

    public List<UploadTaskInfo> getNoneCameraUploadTaskInfos() {
        List<UploadTaskInfo> noneCameraUploadTaskInfos = new ArrayList<>();
        List<UploadTaskInfo> uploadTaskInfos = (List<UploadTaskInfo>) getAllTaskInfoList();
        for (UploadTaskInfo uploadTaskInfo : uploadTaskInfos) {
            // use isCopyToLocal as a flag to mark a camera photo upload task if false
            // mark a file upload task if true
            if (!uploadTaskInfo.isCopyToLocal) {
                continue;
            }
            noneCameraUploadTaskInfos.add(uploadTaskInfo);
        }

        return noneCameraUploadTaskInfos;
    }

    public void retry(int taskID) {
        UploadTask task = (UploadTask) getTask(taskID);
        if (task == null || !task.canRetry())
            return;
        addTaskToQue(task.getSource(), task.getAccount(), task.getRepoID(), task.getRepoName(), task.getDir(), task.getPath(), task.isUpdate(), task.isCopyToLocal(),false);
    }

    private void notifyProgress(int taskID) {
        UploadTaskInfo info = (UploadTaskInfo) getTaskInfo(taskID);
        if (info == null)
            return;

        // use isCopyToLocal as a flag to mark a camera photo upload task if false
        // mark a file upload task if true
        if (!info.isCopyToLocal)
            return;

        //Log.d(DEBUG_TAG, "notify key " + info.repoID);
        if (mNotifyProvider != null) {
            mNotifyProvider.updateNotification();
        }

    }

    public void saveUploadNotifProvider(UploadNotificationProvider provider) {
        mNotifyProvider = provider;
    }

    public boolean hasNotifProvider() {
        return mNotifyProvider != null;
    }

    public UploadNotificationProvider getNotifProvider() {
        if (hasNotifProvider())
            return mNotifyProvider;
        else
            return null;
    }

    public void cancelAllUploadNotification() {
        if (mNotifyProvider != null)
            mNotifyProvider.cancelNotification();
    }

    // -------------------------- listener method --------------------//
    @Override
    public void onFileUploadProgress(int taskID) {
        Intent localIntent = new Intent(BROADCAST_ACTION).putExtra("type",
                BROADCAST_FILE_UPLOAD_PROGRESS).putExtra("taskID", taskID);
        LocalBroadcastManager.getInstance(VaultApp.Companion.getApplication()).sendBroadcast(localIntent);
        notifyProgress(taskID);
    }

    @Override
    public void onFileUploaded(int taskID) {
        remove(taskID);
        doNext();
        Intent localIntent = new Intent(BROADCAST_ACTION).putExtra("type",
                BROADCAST_FILE_UPLOAD_SUCCESS).putExtra("taskID", taskID);
        LocalBroadcastManager.getInstance(VaultApp.Companion.getApplication()).sendBroadcast(localIntent);
        notifyProgress(taskID);
    }

    @Override
    public void onFileUploadCancelled(int taskID) {
        Intent localIntent = new Intent(BROADCAST_ACTION).putExtra("type",
                BROADCAST_FILE_UPLOAD_CANCELLED).putExtra("taskID", taskID);
        LocalBroadcastManager.getInstance(VaultApp.Companion.getApplication()).sendBroadcast(localIntent);
        notifyProgress(taskID);
    }

    @Override
    public void onFileUploadFailed(int taskID) {
        remove(taskID);
        doNext();
        Intent localIntent = new Intent(BROADCAST_ACTION).putExtra("type",
                BROADCAST_FILE_UPLOAD_FAILED).putExtra("taskID", taskID);
        LocalBroadcastManager.getInstance(VaultApp.Companion.getApplication()).sendBroadcast(localIntent);
        notifyProgress(taskID);
    }

}
