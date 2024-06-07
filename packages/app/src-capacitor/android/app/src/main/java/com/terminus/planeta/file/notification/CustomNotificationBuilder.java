package com.terminus.planeta.file.notification;

import android.content.Context;
import android.view.View;
import android.widget.RemoteViews;

import com.terminus.planeta.R;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;

public class CustomNotificationBuilder extends NotificationCompat.Builder {

    private RemoteViews mContentView;

    private CustomNotificationBuilder(@NonNull Context context, @NonNull String channelId) {
        super(context, channelId);
        mContentView = new RemoteViews(context.getPackageName(), R.layout.notification_bar_progress_layout);
        setContent(mContentView);
    }

    /**
     * Fatory method.
     *
     * Instances of this class will be only returned in Android versions needing it.
     *
     * @param context       Context that will use the builder to create notifications
     * @return              An instance of this class, or of the regular
     *                      {@link NotificationCompat.Builder}, when it is good enough.
     */
    public static NotificationCompat.Builder getNotificationBuilder(Context context, String channelId) {
        return new CustomNotificationBuilder(context, channelId);
    }

    /**
     * {@inheritDoc}
     */
    @NonNull
    @Override
    public NotificationCompat.Builder setProgress(int max, int progress, boolean indeterminate) {
        mContentView.setProgressBar(R.id.progress, max, progress, indeterminate);
        if (max > 0) {
            mContentView.setViewVisibility(R.id.progressHolder, View.VISIBLE);
        } else {
            mContentView.setViewVisibility(R.id.progressHolder, View.GONE);
        }
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @NonNull
    @Override
    public NotificationCompat.Builder setSmallIcon(int icon) {
        super.setSmallIcon(icon);   // necessary
        mContentView.setImageViewResource(R.id.icon, icon);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @NonNull
    @Override
    public NotificationCompat.Builder setContentTitle(CharSequence title) {
        super.setContentTitle(title);
        mContentView.setTextViewText(R.id.title, title);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @NonNull
    @Override
    public NotificationCompat.Builder setContentText(CharSequence text) {
        super.setContentText(text);
        mContentView.setTextViewText(R.id.text, text);
        if (text != null && text.length() > 0) {
            mContentView.setViewVisibility(R.id.text, View.VISIBLE);
        } else {
            mContentView.setViewVisibility(R.id.text, View.GONE);
        }
        return this;
    }

}
