package com.terminus.planeta.utils;

import android.app.ActivityManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.util.Base64;

import java.io.ByteArrayOutputStream;
import java.util.List;

import static android.content.Context.ACTIVITY_SERVICE;

/**
 * <pre>
 *     @author : bytetrade
 *     e-mail : zyh2433219116@gmail.com
 *     time   : 2023/01/06
 *     desc   :
 *     version: 1.0
 * </pre>
 */
public class Utils {

    public static int dip2px(Context context, float dpValue) {
        final float scale = context.getResources().getDisplayMetrics().density;
        return (int) (dpValue * scale + 0.5f);
    }

    public static int px2dip(Context context, float pxValue) {
        final float scale = context.getResources().getDisplayMetrics().density;
        return (int) (pxValue / scale + 0.5f);
    }

    public boolean isBaseActivity(Context context,Class<?> activity) {
        Intent intent = new Intent(context, activity);
        ActivityManager am = (ActivityManager) context.getSystemService(ACTIVITY_SERVICE);
        List<ActivityManager.RunningTaskInfo> taskInfoList =am.getRunningTasks(10);//
        //这里获取的是APP栈的数量，一般也就两个
        ActivityManager.RunningTaskInfo runningTaskInfo = taskInfoList.get(0);// 只是拿          当前运行的栈
        String baseActivityClassName = taskInfoList.get(0).baseActivity.getClassName();
        return activity.getName().equals(baseActivityClassName);
    }

    public static int getVersionCode(Context context) {
        int versionCode = 0;
        try {
            versionCode = context.getPackageManager().
                    getPackageInfo(context.getPackageName(), 0).versionCode;
        } catch (PackageManager.NameNotFoundException e) {
            e.printStackTrace();
        }
        return versionCode;
    }

    public static String getVersionName(Context context) {
        String versionName = "";
        try {
            versionName = context.getPackageManager().
                    getPackageInfo(context.getPackageName(), 0).versionName;
        } catch (PackageManager.NameNotFoundException e) {
            e.printStackTrace();
        }
        return versionName;
    }

    public static String bitmapToBase64(Bitmap bitmap) {
        ByteArrayOutputStream byteStream = new ByteArrayOutputStream();
        bitmap.compress(Bitmap.CompressFormat.PNG,100,byteStream);
        byte[] bytes = byteStream.toByteArray();
        return Base64.encodeToString(bytes,Base64.DEFAULT);
    }
}
