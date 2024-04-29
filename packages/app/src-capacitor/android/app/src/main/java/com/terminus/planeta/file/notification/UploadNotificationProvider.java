package com.terminus.planeta.file.notification;

import android.app.PendingIntent;
import android.content.Intent;

import com.terminus.planeta.R;
import com.terminus.planeta.VaultApp;
import com.terminus.planeta.file.transfer.TaskState;
import com.terminus.planeta.file.transfer.TransferManager;
import com.terminus.planeta.file.transfer.TransferService;
import com.terminus.planeta.file.transfer.UploadTaskInfo;
import com.terminus.planeta.file.transfer.UploadTaskManager;
import com.terminus.planeta.file.ui.TransferActivity;

import java.util.List;

import static android.app.PendingIntent.FLAG_IMMUTABLE;
import static com.terminus.planeta.file.notification.NotificationChannelManager.CHANNEL_ID_UPLOAD;

/**
 * Upload notification provider
 *
 */
public class UploadNotificationProvider extends BaseNotificationProvider {

    public UploadNotificationProvider(UploadTaskManager uploadTaskManager,
                                      TransferService transferService) {
        super(uploadTaskManager, transferService);

    }

    public UploadNotificationProvider(TransferManager transferManager, TransferService transferService) {
        super(transferManager, transferService);
    }

    @Override
    protected String getProgressInfo() {
        String progressStatus = "";

        if (txService == null)
            return progressStatus;

        // failed or cancelled tasks won`t be shown in notification state
        // but failed or cancelled detailed info can be viewed in TransferList
        if (getState().equals(NotificationState.NOTIFICATION_STATE_COMPLETED_WITH_ERRORS))
            progressStatus = VaultApp.Companion.getApplication().getString(R.string.notification_upload_completed);
        else if (getState().equals(NotificationState.NOTIFICATION_STATE_COMPLETED))
            progressStatus = VaultApp.Companion.getApplication().getString(R.string.notification_upload_completed);
        else if (getState().equals(NotificationState.NOTIFICATION_STATE_PROGRESS)) {
            int uploadingCount = 0;
            List<UploadTaskInfo> infos = txService.getNoneCameraUploadTaskInfos();
            for (UploadTaskInfo info : infos) {
                if (info.state.equals(TaskState.INIT)
                        || info.state.equals(TaskState.TRANSFERRING))
                    uploadingCount++;
            }

            if (uploadingCount != 0)
                progressStatus = VaultApp.Companion.getApplication().getResources().
                                getQuantityString(R.plurals.notification_upload_info,
                                        uploadingCount,
                                        uploadingCount,
                                        getProgress());
        }
        return progressStatus;
    }

    @Override
    protected void notifyStarted() {
        Intent dIntent = new Intent(VaultApp.Companion.getApplication(), TransferActivity.class);
        dIntent.putExtra(NOTIFICATION_MESSAGE_KEY, NOTIFICATION_OPEN_UPLOAD_TAB);
        dIntent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);

        PendingIntent uPendingIntent = PendingIntent.getActivity(VaultApp.Companion.getApplication(),
                (int) System.currentTimeMillis(), dIntent, FLAG_IMMUTABLE);
        mNotifBuilder = CustomNotificationBuilder.getNotificationBuilder(VaultApp.Companion.getApplication(),
                CHANNEL_ID_UPLOAD)
                .setSmallIcon(R.mipmap.ic_launcher_round)
                .setOnlyAlertOnce(true)
                .setContentTitle(VaultApp.Companion.getApplication().getString(R.string.notification_upload_started_title))
                .setOngoing(true)
                .setContentText(VaultApp.Companion.getApplication().getString(R.string.notification_upload_started_title))
                .setContentIntent(uPendingIntent)
                .setProgress(100, 0, false);

        // Make this service run in the foreground, supplying the ongoing
        // notification to be shown to the user while in this state.
        txService.startForeground(NOTIFICATION_ID_UPLOAD, mNotifBuilder.build());
    }

    @Override
    protected int getProgress() {
        long uploadedSize = 0L;
        long totalSize = 0L;
        if (txService == null)
            return 0;

        List<UploadTaskInfo> infos = txService.getNoneCameraUploadTaskInfos();
        for (UploadTaskInfo info : infos) {
            if (info == null)
                continue;
            uploadedSize += info.uploadedSize;
            totalSize += info.totalSize;
        }

        if (totalSize == 0)
            return 0;

        return (int) (uploadedSize * 100 / totalSize);
    }

    @Override
    protected NotificationState getState() {
        if (txService == null)
            return NotificationState.NOTIFICATION_STATE_COMPLETED;

        List<UploadTaskInfo> infos = txService.getNoneCameraUploadTaskInfos();

        int progressCount = 0;
        int errorCount = 0;

        for (UploadTaskInfo info : infos) {
            if (info == null)
                continue;
            if (info.state.equals(TaskState.INIT)
                    || info.state.equals(TaskState.TRANSFERRING))
                progressCount++;
            else if (info.state.equals(TaskState.FAILED)
                    || info.state.equals(TaskState.CANCELLED))
                errorCount++;
        }

        if (progressCount == 0 && errorCount == 0)
            return NotificationState.NOTIFICATION_STATE_COMPLETED;
        else if (progressCount == 0 && errorCount > 0)
            return NotificationState.NOTIFICATION_STATE_COMPLETED_WITH_ERRORS;
        else // progressCount > 0
            return NotificationState.NOTIFICATION_STATE_PROGRESS;
    }

    @Override
    protected int getNotificationID() {
        return NOTIFICATION_ID_UPLOAD;
    }

    @Override
    protected String getNotificationTitle() {
        return VaultApp.Companion.getApplication().getString(R.string.notification_upload_started_title);
    }

}
