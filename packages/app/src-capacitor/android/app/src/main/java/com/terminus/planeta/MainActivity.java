package com.terminus.planeta;

import android.os.Bundle;

import com.capacitorjs.plugins.filesystem.FilesystemPlugin;
import com.capacitorjs.plugins.statusbar.StatusBarPlugin;
import com.terminus.planeta.file.notification.NotificationChannelManager;
import com.terminus.planeta.plugins.AndroidUniversalPlugin;
import com.terminus.planeta.plugins.AppNativeInfoPlugin;
import com.terminus.planeta.plugins.AutofillFrameworkPlugin;
import com.terminus.planeta.plugins.AccessibilityPlugin;
import com.capacitorjs.plugins.device.DevicePlugin;
import com.codetrixstudio.capacitor.GoogleAuth.GoogleAuth;
import com.getcapacitor.Plugin;
import com.getcapacitor.community.barcodescanner.BarcodeScanner;
import com.getcapacitor.community.facebooklogin.FacebookLogin;
import com.terminus.planeta.plugins.HookCapacitorHttp;
import com.terminus.planeta.plugins.ProxyInfoPlugin;
import com.terminus.planeta.plugins.ScanPhotoQRPlugin;
import com.terminus.planeta.plugins.SeafilePlugin;
import com.terminus.planeta.plugins.TailScalePlugin;
import com.terminus.planeta.plugins.TwitterLoginPlugin;

import java.util.ArrayList;
import java.util.List;

import ee.forgr.biometric.NativeBiometric;

public class MainActivity extends FileActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        List<Class<? extends Plugin>> plugins = new ArrayList<>();
        plugins.add(HookCapacitorHttp.class);
        plugins.add(BarcodeScanner.class);
        plugins.add(DevicePlugin.class);
        plugins.add(FacebookLogin.class);
        plugins.add(ScanPhotoQRPlugin.class);
        plugins.add(TwitterLoginPlugin.class);
        plugins.add(AndroidUniversalPlugin.class);
        plugins.add(AccessibilityPlugin.class);
        plugins.add(AutofillFrameworkPlugin.class);
        plugins.add(GoogleAuth.class);
        plugins.add(AppNativeInfoPlugin.class);
        plugins.add(ProxyInfoPlugin.class);
        plugins.add(SeafilePlugin.class);
        plugins.add(FilesystemPlugin.class);
        plugins.add(TailScalePlugin.class);
        plugins.add(NativeBiometric.class);
        plugins.add(StatusBarPlugin.class);
        registerPlugins(plugins);
        super.onCreate(savedInstanceState);
        NotificationChannelManager.loadNotificationChannel();
    }

}
