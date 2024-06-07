package com.terminus.planeta;

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.ServiceConnection;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Bundle;
import android.os.IBinder;
import android.util.Log;
import android.widget.Toast;

import com.getcapacitor.BridgeActivity;
import com.terminus.planeta.file.ConcurrentAsyncTask;
import com.terminus.planeta.file.NavContext;
import com.terminus.planeta.file.SeafException;
import com.terminus.planeta.file.Utils;
import com.terminus.planeta.file.data.DataManager;
import com.terminus.planeta.file.data.SeafCachedFile;
import com.terminus.planeta.file.data.SeafDirent;
import com.terminus.planeta.file.data.SeafRepo;
import com.terminus.planeta.file.notification.DownloadNotificationProvider;
import com.terminus.planeta.file.notification.UploadNotificationProvider;
import com.terminus.planeta.file.transfer.DownloadTaskInfo;
import com.terminus.planeta.file.transfer.DownloadTaskManager;
import com.terminus.planeta.file.transfer.PendingUploadInfo;
import com.terminus.planeta.file.transfer.TransferManager;
import com.terminus.planeta.file.transfer.TransferService;
import com.terminus.planeta.file.transfer.UploadTaskInfo;
import com.terminus.planeta.file.transfer.UploadTaskManager;
import com.terminus.planeta.plugins.OnTransferListener;
import com.terminus.planeta.utils.Constants;
import com.terminus.planeta.utils.UtilsJellyBean;

import org.apache.commons.io.IOUtils;
import org.jetbrains.annotations.NotNull;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;

import androidx.activity.result.ActivityResult;
import androidx.appcompat.app.AlertDialog;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;

public class FileActivity extends BridgeActivity {

    private static final String DEBUG_TAG = "FileActivity";

    private TransferService txService = null;

    private TransferReceiver mTransferReceiver;

    private Intent monitorIntent;

    private ArrayList<PendingUploadInfo> pendingUploads = new ArrayList<>();

    private NavContext navContext = new NavContext();

    private OnTransferListener listener;

    private final ServiceConnection mConnection = new ServiceConnection() {
        @Override
        public void onServiceConnected(ComponentName className, IBinder service) {
            TransferService.TransferBinder binder = (TransferService.TransferBinder) service;
            txService = binder.getService();
            Log.d(DEBUG_TAG, "bind TransferService");

            for (PendingUploadInfo info : pendingUploads) {
                txService.addTaskToUploadQue(VaultApp.Companion.getApplication().getAccount(),
                        info.repoID,
                        info.repoName,
                        info.targetDir,
                        info.localFilePath,
                        info.isUpdate,
                        info.isCopyToLocal);
            }
            pendingUploads.clear();
        }

        @Override
        public void onServiceDisconnected(ComponentName arg0) {
            txService = null;
        }
    };


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Intent txIntent = new Intent(this, TransferService.class);
        startService(txIntent);
        Log.d(DEBUG_TAG, "start TransferService");

        // bind transfer service
        Intent bIntent = new Intent(this, TransferService.class);
        bindService(bIntent, mConnection, Context.BIND_AUTO_CREATE);
        Log.d(DEBUG_TAG, "try bind TransferService");

        Constants.registerStatusBar(this);
    }


    /**
     * Download a file
     *
     * @param dir
     * @param fileName
     */
    public void downloadFile(String repoName, String repoId, String dir, String fileName) {
        // txService maybe null if layout orientation has changed
        if (txService == null) {
            Log.d(DEBUG_TAG, "downloadFile: txService null");
            return;
        }
        String filePath = Utils.pathJoin(dir, fileName);
        txService.addDownloadTask(VaultApp.Companion.getApplication().getAccount(),
                repoName,
                repoId,
                filePath);

        if (!txService.hasDownloadNotifProvider()) {
            DownloadNotificationProvider provider = new DownloadNotificationProvider(txService.getDownloadTaskManager(),
                    txService);
            txService.saveDownloadNotifProvider(provider);
        }

        List<DownloadTaskInfo> infos = txService.getDownloadTaskInfosByPath(repoId, dir);
        Log.d(DEBUG_TAG, "downloadFile: " + infos.toString());
    }

    public void uploadFile(ActivityResult result){
        if (!Utils.isNetworkOn()) {
            showShortToast(this, getString(R.string.network_down));
            return;
        }
        List<Uri> uriList = UtilsJellyBean.extractUriListFromIntent(result.getData());
        if (uriList.size()> 0) {
            Log.d("???", "uploadFile SAFLoadRemoteFileTask");
            ConcurrentAsyncTask.execute(new SAFLoadRemoteFileTask(), uriList.toArray(new Uri[]{}));
        }
    }

    @Override
    public void onStart() {
        super.onStart();

        if (mTransferReceiver == null) {
            mTransferReceiver = new TransferReceiver();
        }

        IntentFilter filter = new IntentFilter(TransferManager.BROADCAST_ACTION);
        LocalBroadcastManager.getInstance(this).registerReceiver(mTransferReceiver, filter);
    }

    @Override
    public void onStop() {
        super.onStop();

        if (mTransferReceiver != null) {
            LocalBroadcastManager.getInstance(this).unregisterReceiver(mTransferReceiver);
        }
    }

    public void setTransferListener(@NotNull OnTransferListener listener) {
        this.listener = listener;
    }

    private class TransferReceiver extends BroadcastReceiver {

        private TransferReceiver() {
        }

        public void onReceive(Context context, Intent intent) {
            String type = intent.getStringExtra("type");
            int taskID = intent.getIntExtra("taskID", 0);
            switch (type) {
                case DownloadTaskManager.BROADCAST_FILE_DOWNLOAD_FAILED ->
                        onFileDownloadFailed(taskID);
                case UploadTaskManager.BROADCAST_FILE_UPLOAD_SUCCESS -> onFileUploaded(taskID);
                case UploadTaskManager.BROADCAST_FILE_UPLOAD_FAILED -> onFileUploadFailed(taskID);
                case DownloadTaskManager.BROADCAST_FILE_DOWNLOAD_SUCCESS ->
                        onFileDownloadSuccess(taskID);
            }
        }

    } // TransferReceiver

    private void onFileDownloadSuccess(int taskID) {
        if (txService == null) {
            return;
        }

        DownloadTaskInfo info = txService.getDownloadTaskInfo(taskID);
        if (info == null)
            return;

        SeafCachedFile cf = VaultApp.Companion.getApplication().getDataManager().getCachedFile(info.repoName,info.repoID,info.pathInRepo);
        if (cf != null && cf.fileID != null) {
            this.listener.onDownloadSuccess(cf.path,cf.fileID,cf.getFileUri());
        }
    }

    private void onFileDownloadFailed(int taskID) {
        if (txService == null) {
            return;
        }

        DownloadTaskInfo info = txService.getDownloadTaskInfo(taskID);
        if (info == null)
            return;

        final SeafException err = info.err;
        final String repoName = info.repoName;
        final String repoID = info.repoID;
        final String path = info.pathInRepo;

//        if (err != null && err.getCode() == SeafConnection.HTTP_STATUS_REPO_PASSWORD_REQUIRED) {
//            if (currentPosition == INDEX_LIBRARY_TAB
//                    && repoID.equals(navContext.getRepoID())
//                    && Utils.getParentPath(path).equals(navContext.getDirPath())) {
//                showPasswordDialog(repoName, repoID,
//                        new TaskDialog.TaskDialogListener() {
//                            @Override
//                            public void onTaskSuccess() {
//                                txService.addDownloadTask(account,
//                                        repoName,
//                                        repoID,
//                                        path);
//                            }
//                        });
//                return;
//            }
//        }

        showShortToast(this, getString(R.string.download_failed));
    }

    private void onFileUploaded(int taskID) {
        if (txService == null) {
            return;
        }

        UploadTaskInfo info = txService.getUploadTaskInfo(taskID);

        if (info == null) {
            return;
        }

        String verb = getString(info.isUpdate ? R.string.updated : R.string.uploaded);
        showShortToast(this, verb + " " + Utils.fileNameFromPath(info.localFilePath));
        listener.onUploadSuccess();
    }

    public void setNavContext(NavContext navContext){
        this.navContext = navContext;
    }

    private int intShowErrorTime;

    private void onFileUploadFailed(int taskID) {
        if (++intShowErrorTime <= 1)
            showShortToast(this, getString(R.string.upload_failed));
    }

    public void showShortToast(final Activity activity, final String message) {
        if (activity == null)
            return;
        Toast.makeText(activity, message, Toast.LENGTH_SHORT).show();
    }

    private class SAFLoadRemoteFileTask extends AsyncTask<Uri, Void, File[]> {

        @Override
        protected File[] doInBackground(Uri... uriList) {
            if (uriList == null)
                return null;

            List<File> fileList = new ArrayList<File>();
            for (Uri uri : uriList) {
                // Log.d(DEBUG_TAG, "Uploading file from uri: " + uri);
                InputStream in = null;
                OutputStream out = null;

                try {
                    File tempDir = DataManager.createTempDir();
                    File tempFile = new File(tempDir, Utils.getFilenamefromUri(FileActivity.this, uri));

                    if (!tempFile.createNewFile()) {
                        throw new RuntimeException("could not create temporary file");
                    }

                    in = getContentResolver().openInputStream(uri);
                    out = new FileOutputStream(tempFile);
                    IOUtils.copy(in, out);

                    fileList.add(tempFile);

                } catch (IOException e) {
                    Log.d(DEBUG_TAG, "Could not open requested document", e);
                } catch (RuntimeException e) {
                    Log.d(DEBUG_TAG, "Could not open requested document", e);
                } finally {
                    IOUtils.closeQuietly(in);
                    IOUtils.closeQuietly(out);
                }
            }
            return fileList.toArray(new File[]{});
        }

        @Override
        protected void onPostExecute(File... fileList) {
            if (fileList == null) return;

            List<SeafDirent> list = VaultApp.Companion.getApplication().getDataManager().getCachedDirents(navContext.getRepoID(), navContext.getDirPath());

            for (final File file : fileList) {
                if (file == null) {
                    showShortToast(FileActivity.this, getString(R.string.saf_upload_path_not_available));
                } else {
                    if (list == null) {
                        Log.e(DEBUG_TAG, "dirent cache is empty in uploadFile. Should not happen, aborting.");
                    }

                    boolean duplicate = false;
                    if (list != null) {
                        for (SeafDirent dirent : list) {
                            if (dirent.name.equals(file.getName())) {
                                duplicate = true;
                                break;
                            }
                        }
                    }

                    if (!duplicate) {
                        final SeafRepo repo = VaultApp.Companion.getApplication().getDataManager().getCachedRepoByID(navContext.getRepoID());
                        showShortToast(FileActivity.this, getString(R.string.added_to_upload_tasks));
                        if (repo != null && repo.canLocalDecrypt()) {
                            addUploadBlocksTask(repo.id, repo.name, navContext.getDirPath(), file.getAbsolutePath());
                        } else {
                            addUploadTask(navContext.getRepoID(), navContext.getRepoName(), navContext.getDirPath(), file.getAbsolutePath());
                        }
                    } else {
                        showFileExistDialog(file);
                    }
                }
            }

            if (txService == null)
                return;

            if (!txService.hasUploadNotifProvider()) {
                UploadNotificationProvider provider = new UploadNotificationProvider(
                        txService.getUploadTaskManager(),
                        txService);
                txService.saveUploadNotifProvider(provider);
            }
        }
    }

    private int addUploadTask(String repoID, String repoName, String targetDir, String localFilePath) {
        if (txService != null) {
            return txService.addTaskToUploadQue(VaultApp.Companion.getApplication().getAccount(), repoID, repoName, targetDir, localFilePath, false, true);
        } else {
            PendingUploadInfo info = new PendingUploadInfo(repoID, repoName, targetDir, localFilePath, false, true);
            pendingUploads.add(info);
            return 0;
        }
    }

    private int addUploadBlocksTask(String repoID, String repoName, String targetDir, String localFilePath) {
        if (txService != null) {
            return txService.addTaskToUploadQueBlock(VaultApp.Companion.getApplication().getAccount(), repoID, repoName, targetDir, localFilePath, false, true);
        } else {
            PendingUploadInfo info = new PendingUploadInfo(repoID, repoName, targetDir, localFilePath, false, true);
            pendingUploads.add(info);
            return 0;
        }
    }

    private void showFileExistDialog(final File file) {
        final SeafRepo repo = VaultApp.Companion.getApplication().getDataManager().getCachedRepoByID(navContext.getRepoID());
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle(getString(R.string.upload_file_exist));
        builder.setMessage(String.format(getString(R.string.upload_duplicate_found), file.getName()));
        builder.setPositiveButton(getString(R.string.upload_replace), new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                showShortToast(FileActivity.this, getString(R.string.added_to_upload_tasks));
                if (repo != null && repo.canLocalDecrypt()) {
                    addUpdateBlocksTask(repo.id, repo.name, navContext.getDirPath(), file.getAbsolutePath());
                } else {
                    addUpdateTask(navContext.getRepoID(), navContext.getRepoName(), navContext.getDirPath(), file.getAbsolutePath());
                }
            }
        });
        builder.setNeutralButton(getString(R.string.cancel), new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
            }
        });
        builder.setNegativeButton(getString(R.string.upload_keep_both), new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                if (repo != null && repo.canLocalDecrypt()) {
                    addUploadBlocksTask(repo.id, repo.name, navContext.getDirPath(), file.getAbsolutePath());
                } else {
                    addUploadTask(navContext.getRepoID(), navContext.getRepoName(), navContext.getDirPath(), file.getAbsolutePath());
                }
            }
        });
        builder.show();
    }

    public void addUpdateTask(String repoID, String repoName, String targetDir, String localFilePath) {
        if (txService != null) {
            txService.addTaskToUploadQue(VaultApp.Companion.getApplication().getAccount(), repoID, repoName, targetDir, localFilePath, true, true);
        } else {
            PendingUploadInfo info = new PendingUploadInfo(repoID, repoName, targetDir, localFilePath, true, true);
            pendingUploads.add(info);
        }
    }

    public void addUpdateBlocksTask(String repoID, String repoName, String targetDir, String localFilePath) {
        if (txService != null) {
            txService.addTaskToUploadQueBlock(VaultApp.Companion.getApplication().getAccount(), repoID, repoName, targetDir, localFilePath, true, true);
        } else {
            PendingUploadInfo info = new PendingUploadInfo(repoID, repoName, targetDir, localFilePath, true, true);
            pendingUploads.add(info);
        }
    }
}
