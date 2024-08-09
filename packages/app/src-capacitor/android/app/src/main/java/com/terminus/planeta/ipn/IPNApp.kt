package com.terminus.planeta.ipn

import android.app.NotificationChannel
import android.content.ComponentName
import android.content.Intent
import android.content.ServiceConnection
import android.content.SharedPreferences
import android.net.ConnectivityManager
import android.net.ConnectivityManager.NetworkCallback
import android.net.LinkProperties
import android.net.Network
import android.net.NetworkRequest
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.provider.Settings
import android.text.TextUtils
import android.util.Log
import android.widget.Toast
import androidx.core.app.NotificationManagerCompat
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import com.terminus.planeta.VaultApp
import com.terminus.planeta.ipn.IPNService.IPNBinder
import com.terminus.planeta.plugins.OnTailscaleStatusListener
import com.terminus.planeta.utils.Constants.VPN_STATUS_NEEDS_LOGIN
import com.terminus.planeta.utils.Constants.VPN_STATUS_STARTING
import com.terminus.planeta.utils.RunnablePocket
import local_vpn_sdk.Local_vpn_sdk
import org.json.JSONObject
import utils.Callback
import java.io.IOException
import java.net.NetworkInterface
import java.security.GeneralSecurityException
import java.util.Collections
import java.util.Locale
import kotlin.math.log


/**
 * <pre>
 *     @author : bytetrade
 *     e-mail : zyh2433219116@gmail.com
 *     time   : 2023/02/09
 *     desc   :
 *     version: 1.0
 * </pre>
 */
class IPNApp : VaultApp() {
    private var ipnServiceConn: IPNServiceConn? = null
    private var ipnService: IPNService? = null
    private var statusListener: OnTailscaleStatusListener? = null;
    private var getStatusCount = 0

    @JvmField
    var autoConnect = false

    override fun onCreate() {
        super.onCreate()
        instance = this
        createNotificationChannel(
            NOTIFY_CHANNEL_ID,
            "Notifications",
            NotificationManagerCompat.IMPORTANCE_DEFAULT
        )
        createNotificationChannel(
            STATUS_CHANNEL_ID,
            "VPN Status",
            NotificationManagerCompat.IMPORTANCE_LOW
        )
        registerNetworkCallback()

//            override fun getDnsConfig(): String {
//               return DnsConfig(instance).dnsConfigAsString
//            }
//
//            override fun getHostName(): String {
//                val userConfiguredDeviceName = userConfiguredDeviceName
//                return if (!isEmpty(userConfiguredDeviceName)) userConfiguredDeviceName!! else modelName
//            }
//
//
//            override fun getOSVersion(): String {
//                return Build.VERSION.RELEASE
//            }
//
//            override fun isChromeOS(): Boolean {
//                return packageManager.hasSystemFeature("android.hardware.type.pc")
//            }
//
//            override fun setTileReady(p0: Boolean) {
//                if (Build.VERSION.SDK_INT < Build.VERSION_CODES.N) {
//                    return
//                }
//                QuickToggleService.setReady(instance, p0)
//                Log.d("App", "Set Tile Ready: $p0 $autoConnect")
//                vpnReady = p0
//                if (p0 && autoConnect) {
//                    Sdk.startVPN()
//                }
//            }
//
//            override fun setTileStatus(p0: Boolean) {
//                if (Build.VERSION.SDK_INT < Build.VERSION_CODES.N) {
//                    return
//                }
//                QuickToggleService.setStatus(instance, p0)
//            }
//
    }


    fun ipnStart() {
        if (ipnServiceConn == null) {
            Log.i("IPN", "bindService")
            val intent = Intent(instance, IPNService::class.java)
            intent.action = IPNService.ACTION_CONNECT
            ipnServiceConn = IPNServiceConn()
            bindService(intent, ipnServiceConn!!, BIND_AUTO_CREATE)
        }
        Log.i("IPN", "init start")
        Log.i("IPN", "${application?.cookies}")
        val root: String = applicationContext.filesDir.absolutePath
        Local_vpn_sdk.sdkInitFunc(
            0,
            application?.scaleServer,
            application?.authKey,
            root,
            application?.cookies,
            object : Callback {

                override fun doCallback(p0: String?) {
                    Log.i("IPN", "doCallback $p0")
//                    if (p0.isNullOrEmpty()) {
//                        return
//                    }
//                    try {
//                        val jsonObject = JSONObject(p0)
//                        val code = jsonObject.optInt("code", -1)
//                        val msg = jsonObject.optString("msg", "")
//                        val status = jsonObject.optString("status", "")
//                        if (code == 0) {
//                            statusListener?.onStatusUpdate(status)
//
//                          if (status == VPN_STATUS_STARTING) {
//                            if (getStatusCount < 15) {
//                              getStatusCount += 1;
////                              var jsonString = Local_vpn_sdkStatus()
//                            }
//                          }
//
//                        } else {
//                            Log.i("IPN", "doCallback error : $code $msg")
//                        }
//                    } catch (e : Exception) {
//                        Log.i("IPN", "doCallback error : ${e.message}")
//                    }
                    resoleSDKStatusNotify(p0)
                }

                override fun getFd(): Long {
                    return 0
                }

                override fun init(p0: String?) {
                    Log.i("IPN", "init $p0")
                    if (p0.isNullOrEmpty()) {
                        return
                    }
                    try {
                        val jsonObject = JSONObject(p0)
                        val code = jsonObject.optInt("code", -1)
                        val msg = jsonObject.optString("msg", "")
                        val status = jsonObject.optString("status", "")
                        if (code == 0) {
                            if (VPN_STATUS_NEEDS_LOGIN == status) {
                                try {
                                    Local_vpn_sdk.login()
                                } catch (e: Exception) {
                                    Log.i("IPN", "Local_vpn_sdk.login " + e.message)
                                }
                            }
                        } else {
                            if (exitUtils?.topActivity != null) {
                                Toast.makeText(exitUtils?.topActivity, msg, Toast.LENGTH_SHORT)
                                    .show()
                            }
                        }
                    } catch (e: Exception) {
                        Log.i("IPN", "init error : ${e.message}")
                    }
                }

                override fun log(p0: String?) {
                    Log.i("IPN", "log -> $p0")
                }

                override fun readString(key: String?): String {
                    Log.i("IPN", "read $key")
                    val mm = encryptedPrefs.getString(key, null)
                    Log.d("IPN", "decryptFromPref: $mm")
                    return mm ?: ""
                }

                override fun setAndroidProtect(p0: Long) {
                    Log.i("IPN", "setAndroidProtect $p0")
                    ipnService?.setSocketProtect(p0.toInt())
                }

                override fun setRouter(address: String?, router: String?) {
                    Log.i("IPN", "setRouter $router $address")
                }

                override fun getInterfacesAsString(): String {
                    val interfaces: List<NetworkInterface> = try {
                        Collections.list(NetworkInterface.getNetworkInterfaces())
                    } catch (e: Exception) {
                        return ""
                    }
                    val sb = StringBuilder("")
                    for (nif in interfaces) {
                        try {
                            // Android doesn't have a supportsBroadcast() but the Go net.Interface wants
                            // one, so we say the interface has broadcast if it has multicast.
                            sb.append(
                                String.format(
                                    Locale.ROOT, "%s %d %d %b %b %b %b %b |", nif.name,
                                    nif.index, nif.mtu, nif.isUp, nif.supportsMulticast(),
                                    nif.isLoopback, nif.isPointToPoint, nif.supportsMulticast()
                                )
                            )
                            for (ia in nif.interfaceAddresses) {
                                // InterfaceAddress == hostname + "/" + IP
                                val parts =
                                    ia.toString().split("/".toRegex())
                                        .dropLastWhile { it.isEmpty() }
                                        .toTypedArray()
                                if (parts.size > 1) {
                                    sb.append(
                                        String.format(
                                            Locale.ROOT,
                                            "%s/%d ",
                                            parts[1],
                                            ia.networkPrefixLength
                                        )
                                    )
                                }
                            }
                        } catch (e: Exception) {
                            // TODO(dgentry) should log the exception not silently suppress it.
                            continue
                        }
                        sb.append("\n")
                    }
                    return sb.toString()
                }

                override fun updateTun(
                    dnsServer: String?,
                    searchDomain: String?,
                    router: String?,
                    address: String?
                ): Long {
                    if (ipnService != null) {
                        return ipnService?.updateTUN(dnsServer, searchDomain, router, address)!!
                            .toLong()
                    }
                    return 0
                }

                override fun writeString(key: String?, value: String?) {
                    Log.d("IPN", "encryptToPref: $key $value")
                    encryptedPrefs.edit().putString(key, value).commit()
                }

            })
        try {
            Local_vpn_sdk.login()
        } catch (e: Exception) {
            Log.i("IPN", "Local_vpn_sdk.login " + e.message)
        }
    }

    fun ipnClose() {
        Log.i("IPN", "ipnClose")
        Local_vpn_sdk.logout()
        if (ipnServiceConn != null) {
            unbindService(ipnServiceConn!!)
            ipnServiceConn = null
            Log.i("IPN", "unbindService")
        }
    }

    fun status(): String {
        Log.i("IPN", "ipnStatus")
        return Local_vpn_sdk.status()
    }

    fun peersState(): String {
        Log.i("IPN", "peersState" + Local_vpn_sdk.state())
        return Local_vpn_sdk.state();
    }

    private fun resoleSDKStatusNotify(notify: String?) {
        Log.i("IPN ", "resoleSDKStatusNotify " + notify)

        if (notify.isNullOrEmpty()) {
            return
        }
        try {
            val jsonObject = JSONObject(notify)
            val code = jsonObject.optInt("code", -1)
            val msg = jsonObject.optString("msg", "")
            val status = jsonObject.optString("status", "")
            if (code == 0) {
                if (status == VPN_STATUS_STARTING) {
                    if (getStatusCount < 15) {
                        getStatusCount += 1;
                        RunnablePocket.postDelayed({
                            var statusStr = status()
                            resoleSDKStatusNotify(statusStr)
                        }, 1000)
                        return
                    }
                }
                getStatusCount = 0
                statusListener?.onStatusUpdate(status)
            } else {
                Log.i("IPN", "doCallback error : $code $msg")
            }
        } catch (e: Exception) {
            Log.i("IPN", "doCallback error : ${e.message}")
        }
    }

    private fun registerNetworkCallback() {
        val cMgr = this.getSystemService(CONNECTIVITY_SERVICE) as ConnectivityManager
        cMgr.registerNetworkCallback(NetworkRequest.Builder().build(), object : NetworkCallback() {
            private fun reportConnectivityChange() {
                val active = cMgr.activeNetworkInfo
                // https://developer.android.com/training/monitoring-device-state/connectivity-status-type
                val isConnected = active != null && active.isConnectedOrConnecting
                if (isConnected) {
                    (applicationContext as IPNApp).autoConnect = false
                }
//                Sdk.onConnectivityChanged(isConnected)
            }

            override fun onLost(network: Network) {
                super.onLost(network)
                reportConnectivityChange()
            }

            override fun onLinkPropertiesChanged(network: Network, linkProperties: LinkProperties) {
                super.onLinkPropertiesChanged(network, linkProperties)
                reportConnectivityChange()
            }
        })
    }

    internal inner class IPNServiceConn : ServiceConnection {
        override fun onBindingDied(name: ComponentName) {
            super.onBindingDied(name)
        }

        override fun onNullBinding(name: ComponentName) {
            super.onNullBinding(name)
        }

        override fun onServiceConnected(name: ComponentName, service: IBinder) {
            val ipnBinder = service as IPNBinder
            ipnService = ipnBinder.service
        }

        override fun onServiceDisconnected(name: ComponentName) {
            ipnService = null
        }
    }

    @get:Throws(IOException::class, GeneralSecurityException::class)
    private val encryptedPrefs: SharedPreferences
        get() {
            val key = MasterKey.Builder(this)
                .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
                .build()
            return EncryptedSharedPreferences.create(
                this,
                "secret_shared_prefs",
                key,
                EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
            )
        }

    // get user defined nickname from Settings
    // returns null if not available
    private val userConfiguredDeviceName: String?
        get() {
            val nameFromSystemDevice = Settings.Secure.getString(contentResolver, "device_name")
            return if (!TextUtils.isEmpty(nameFromSystemDevice)) nameFromSystemDevice else null
        }

    fun createNotificationChannel(id: String?, name: String?, importance: Int) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return
        }
        val channel = NotificationChannel(id, name, importance)
        val nm = NotificationManagerCompat.from(this)
        nm.createNotificationChannel(channel)
    }

    fun setOnTailscaleStatusListener(statusListener: OnTailscaleStatusListener) {
        this.statusListener = statusListener;
    }

    fun exportEncryptedPrefsGetString(key: String): String {
        val mm = encryptedPrefs.getString(key, null)
        return mm ?: ""
    }

    companion object {
        const val STATUS_CHANNEL_ID = "ipn-status"
        const val STATUS_NOTIFICATION_ID = 1
        const val NOTIFY_CHANNEL_ID = "ipn-notify"
        const val NOTIFY_NOTIFICATION_ID = 2
        private val mainHandler = Handler(Looper.getMainLooper())
        var instance: IPNApp? = null
    }
}
