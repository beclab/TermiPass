package com.terminus.planeta.file.cameraupload;


import android.app.job.JobParameters;
import android.app.job.JobService;
import android.content.SharedPreferences;
import android.util.Log;

import com.terminus.planeta.file.SettingsManager;

/**
 * This service monitors the media provider content provider for new images/videos.
 */
public class MediaSchedulerService extends JobService {
    private SettingsManager mSettingsManager;


    @Override
    public boolean onStartJob(JobParameters jobParameters) {
        Log.i(MediaSchedulerService.class.getName(),"MediaSchedulerService exec job");
        mSettingsManager = SettingsManager.instance();
        mSettingsManager.registerSharedPreferencesListener(settingsListener);
        jobFinished(jobParameters, true);
        return true;
    }

    @Override
    public boolean onStopJob(JobParameters jobParameters) {
        if (mSettingsManager != null) {
            mSettingsManager.unregisterSharedPreferencesListener(settingsListener);
        }
        return false;
    }


    /**
     * If camera upload settings have changed, we might have to trigger a full resync.
     * This listener takes care of that.
     */
    private SharedPreferences.OnSharedPreferenceChangeListener settingsListener =
            new SharedPreferences.OnSharedPreferenceChangeListener() {

                @Override
                public void onSharedPreferenceChanged(SharedPreferences sharedPreferences, String key) {

                    boolean doFullResync = false;

                    // here we have to catch *all* the cases that might make a full resync to the repository
                    // necessary.

                    switch (key) {

                        // if video upload has been switched on, do a full sync, to upload
                        // any older videos already recorded.
                        case SettingsManager.CAMERA_UPLOAD_ALLOW_VIDEOS_SWITCH_KEY:
                            if (mSettingsManager != null && mSettingsManager.isVideosUploadAllowed())
                                doFullResync = true;
                            break;

                        // same goes for if the list of selected buckets has been changed
                        case SettingsManager.SHARED_PREF_CAMERA_UPLOAD_BUCKETS:
                            doFullResync = true;
                            break;

                        // the repo changed, also do a full resync
                        case SettingsManager.SHARED_PREF_CAMERA_UPLOAD_REPO_ID:
                            doFullResync = true;
                            break;
                    }

                }
            };
}
