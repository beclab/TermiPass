// Copyright (c) 2020 Tailscale Inc & AUTHORS All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

package com.terminus.planeta.ipn;

import android.app.PendingIntent;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.VpnService;
import android.os.Binder;
import android.os.Build;
import android.os.IBinder;
import android.os.ParcelFileDescriptor;
import android.system.OsConstants;
import android.util.Log;

import com.terminus.planeta.BuildConfig;
import com.terminus.planeta.MainActivity;
import com.terminus.planeta.R;

import java.util.Arrays;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

public class IPNService extends VpnService {
    public static final String ACTION_CONNECT = BuildConfig.APPLICATION_ID + ".CONNECT";
    public static final String ACTION_DISCONNECT = BuildConfig.APPLICATION_ID + ".DISCONNECT";

    private static final int DEFAULT_MTU = 1280;

    private String[] googleDNSServers = new String[]{
            "8.8.8.8",
            "8.8.4.4",
            "2001:4860:4860::8888",
            "2001:4860:4860::8844"
    };

    private IPNBinder mBinder = new IPNBinder();

    public void setSocketProtect(int socketId) {
        protect(socketId);
    }

    public class IPNBinder extends Binder {
        IPNService getService() {
            return IPNService.this;
        }
    }

    @Override
    public IBinder onBind(Intent intent) {
        if (intent != null && ACTION_DISCONNECT.equals(intent.getAction())) {
            close();
        }
        return mBinder;
    }

    private void close() {
        Log.i("IPN", "close");
        stopForeground(true);
    }

    @Override
    public void onCreate() {
        super.onCreate();
        Log.i("IPN", "onCreate");
    }

    @Override
    public void onDestroy() {
        close();
        Log.i("IPN", "onDestroy");
        super.onDestroy();
    }

    @Override
    public void onRevoke() {
        close();
        Log.i("IPN", "onRevoke");
        super.onRevoke();
    }

    private PendingIntent configIntent() {
        return PendingIntent.getActivity(this, 0, new Intent(this, MainActivity.class),
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    private void disallowApp(Builder b, String name) {
        try {
            b.addDisallowedApplication(name);
        } catch (PackageManager.NameNotFoundException e) {
            return;
        }
    }

    private Builder newBuilder() {
        Builder b = new Builder()
                .setConfigureIntent(configIntent())
                .allowFamily(OsConstants.AF_INET)
                .allowFamily(OsConstants.AF_INET6);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q)
            b.setMetered(false); // Inherit the metered status from the underlying networks.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M)
            b.setUnderlyingNetworks(null); // Use all available networks.

        // RCS/Jibe https://github.com/tailscale/tailscale/issues/2322
        this.disallowApp(b, "com.google.android.apps.messaging");

        // Stadia https://github.com/tailscale/tailscale/issues/3460
        this.disallowApp(b, "com.google.stadia.android");

        // Android Auto https://github.com/tailscale/tailscale/issues/3828
        this.disallowApp(b, "com.google.android.projection.gearhead");

        // GoPro https://github.com/tailscale/tailscale/issues/2554
        this.disallowApp(b, "com.gopro.smarty");

        // Sonos https://github.com/tailscale/tailscale/issues/2548
        this.disallowApp(b, "com.sonos.acr");
        this.disallowApp(b, "com.sonos.acr2");

        // Google Chromecast https://github.com/tailscale/tailscale/issues/3636
        this.disallowApp(b, "com.google.android.apps.chromecast.app");

        return b;
    }

    //	String[] dnsServers, String[] searchDomains,Prefix[] routers, Prefix[] address
    int updateTUN(String dnsServer, String searchDomain, String routers, String address) {
        Log.i("IPN", "updateTUN");
        Log.i("IPN", "dnsServer" + dnsServer);
        Log.i("IPN", "searchDomain" + searchDomain);
        Log.i("IPN", "routers" + routers);
        Log.i("IPN", "address" + address);
        Builder builder = newBuilder();
        builder.setMtu(DEFAULT_MTU);
//		String[] tempArray = dnsServers;
//		if (tempArray.length == 0){
//			tempArray = googleDNSServers;
//		}
//		for (String dnsServer : tempArray) {
//			builder.addDnsServer(dnsServer);
//		}
//		for (String domain : searchDomains){
//			builder.addSearchDomain(domain);
//		}

//		for (Prefix router : routers) {
//			builder.addRoute(router.ip,router.bitsPlusOne);
//		}
//		for (Prefix prefix : address) {
//			builder.addAddress(prefix.ip,prefix.bitsPlusOne);
//		}
        parseGoArray1(dnsServer, data -> builder.addDnsServer(data[0]));
        parseGoArray1(searchDomain, data -> builder.addSearchDomain(data[0]));
        parseGoArray2(routers, data -> builder.addRoute(data[0], Integer.parseInt(data[1])));
        parseGoArray2(address, data -> builder.addAddress(data[0], Integer.parseInt(data[1])));

        ParcelFileDescriptor descriptor = builder.establish();
        int socket = descriptor.detachFd();
        Log.i("IPN", "updateTUN" + socket);
        protect(socket);
        return socket;
    }

    private interface Callback {
        void call(String... data);
    }

    private void parseGoArray1(String dataArray, Callback callback) {
        if (dataArray.isEmpty()) {
            return;
        }
        String[] array = dataArray.split(",");
        for (String data : array) {
            callback.call(data);
            Log.i("IPN", "parseGoArray1" + data);
        }
    }

    private void parseGoArray2(String dataArray, Callback callback) {
        if (dataArray.isEmpty()) {
            return;
        }
        String[] array = dataArray.split(",");
        for (String data : array) {
            String[] routerArray = data.split("/");
            if (routerArray.length > 1) {
                callback.call(routerArray);
                Log.i("IPN", "parseGoArray2" + Arrays.toString(routerArray));
            }
        }
    }

    public void notify(String title, String message) {
        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, IPNApp.NOTIFY_CHANNEL_ID)
                .setSmallIcon(R.mipmap.ic_launcher_round)
                .setContentTitle(title)
                .setContentText(message)
                .setContentIntent(configIntent())
                .setAutoCancel(true)
                .setOnlyAlertOnce(true)
                .setPriority(NotificationCompat.PRIORITY_DEFAULT);

        NotificationManagerCompat nm = NotificationManagerCompat.from(this);
        nm.notify(((IPNApp) getApplicationContext()).NOTIFY_NOTIFICATION_ID, builder.build());
    }

    public void updateStatusNotification(String title, String message) {
        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, IPNApp.STATUS_CHANNEL_ID)
                .setSmallIcon(R.mipmap.ic_launcher_round)
                .setContentTitle(title)
                .setContentText(message)
                .setContentIntent(configIntent())
                .setPriority(NotificationCompat.PRIORITY_LOW);

        startForeground(IPNApp.STATUS_NOTIFICATION_ID, builder.build());
    }

}
