package com.terminus.planeta.utils;

import android.app.Activity;
import android.app.Application;
import android.os.Bundle;

import java.util.ArrayList;

public class ExitUtils implements Application.ActivityLifecycleCallbacks {

    private ArrayList<Activity> activities = new ArrayList<>();

    public ExitUtils(Application application){
        application.registerActivityLifecycleCallbacks(this);
    }

    @Override
    public void onActivityCreated(Activity activity, Bundle savedInstanceState) {
        activities.add(activity);
        onActivitysNotEmpty();
    }

    private void onActivitysNotEmpty() {

    }

    @Override
    public void onActivityStarted(Activity activity) {

    }

    @Override
    public void onActivityResumed(Activity activity) {

    }

    @Override
    public void onActivityPaused(Activity activity) {

    }

    @Override
    public void onActivityStopped(Activity activity) {

    }

    @Override
    public void onActivitySaveInstanceState(Activity activity, Bundle outState) {

    }

    public Activity getTopActivity() {
        if (activities.isEmpty()) {
            return null;
        }
        return activities.get(activities.size() - 1);
    }

    @Override
    public void onActivityDestroyed(Activity activity) {
        activities.remove(activity);

        if(activities.size() == 0){
            onActivitysEmpty();
        }
    }

    private void onActivitysEmpty() {

    }

    public void letItGo() {
        ArrayList<Activity> removeList=new ArrayList<>(activities);
        for (Activity activity : removeList) {
            activity.finish();
        }
    }

    public void exitInPeace(){
        letItGo();
        System.exit(0);
    }
}
