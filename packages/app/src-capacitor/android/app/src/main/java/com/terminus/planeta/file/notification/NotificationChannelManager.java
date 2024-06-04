package com.terminus.planeta.file.notification;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.media.AudioAttributes;
import android.os.Build;
import android.provider.Settings;

import com.terminus.planeta.VaultApp;

import java.util.ArrayList;
import java.util.List;

import androidx.annotation.Nullable;
import androidx.annotation.RequiresApi;

/**
 * <pre>
 *     @author : bytetrade
 *     e-mail : zyh2433219116@gmail.com
 *     time   : 2023/08/15
 *     desc   :
 *     version: 1.0
 * </pre>
 */
public class NotificationChannelManager {

    public static final String CHANNEL_ID_ERROR = "error";
    public static final String CHANNEL_ID_UPLOAD = "upload";
    public static final String CHANNEL_ID_DOWNLOAD = "download";

    public static void loadNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            List<NotificationChannel> channelList = new ArrayList<>();

            channelList.add(createChannel(CHANNEL_ID_DOWNLOAD, "download channel", "download notification", NotificationManager.IMPORTANCE_HIGH, null));
            channelList.add(createChannel(CHANNEL_ID_UPLOAD, "upload channel", "download notification", NotificationManager.IMPORTANCE_HIGH, null));
            channelList.add(createChannel(CHANNEL_ID_ERROR, "error channel", "error notification", NotificationManager.IMPORTANCE_HIGH, null));

            NotificationManager notificationManager = VaultApp.Companion.getApplication().getSystemService(android.app.NotificationManager.class);
            channelList.forEach(notificationManager::createNotificationChannel);
        }
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    private static NotificationChannel createChannel(String channelId, String name, String description, int importance, @Nullable AudioAttributes audioAttributes) {
        NotificationChannel channel = new NotificationChannel(channelId, name, importance);
        channel.setDescription(description);
        if (audioAttributes != null) {
            channel.setSound(Settings.System.DEFAULT_NOTIFICATION_URI, audioAttributes);
        }
        return channel;
    }
}
