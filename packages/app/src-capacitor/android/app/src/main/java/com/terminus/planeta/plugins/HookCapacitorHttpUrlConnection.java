package com.terminus.planeta.plugins;

import com.getcapacitor.plugin.util.CapacitorHttpUrlConnection;
import com.getcapacitor.plugin.util.HttpRequestHandler;

import java.io.IOException;
import java.net.HttpURLConnection;

/**
 * <pre>
 *     @author : bytetrade
 *     e-mail : zyh2433219116@gmail.com
 *     time   : 2023/11/13
 *     desc   :
 *     version: 1.0
 * </pre>
 */
class HookCapacitorHttpUrlConnection extends CapacitorHttpUrlConnection {

    private final HttpURLConnection httpURLConnection;
    /**
     * Make a new CapacitorHttpUrlConnection instance, which wraps around HttpUrlConnection
     * and provides some helper functions for setting request headers and the request body
     *
     * @param conn the base HttpUrlConnection. You can pass the value from
     *             {@code (HttpUrlConnection) URL.openConnection()}
     */
    public HookCapacitorHttpUrlConnection(HttpURLConnection conn) {
        super(conn);
        httpURLConnection = conn;
    }

    public void setRequestProperty(String key,String value) {
        httpURLConnection.setRequestProperty(key, value);
    }

    public static class HookHttpURLConnectionBuilder extends HttpRequestHandler.HttpURLConnectionBuilder {

        @Override
        public HttpRequestHandler.HttpURLConnectionBuilder openConnection() throws IOException {
            connection = new HookCapacitorHttpUrlConnection((HttpURLConnection) url.openConnection());

            connection.setAllowUserInteraction(false);
            connection.setRequestMethod(method);

            if (connectTimeout != null) connection.setConnectTimeout(connectTimeout);
            if (readTimeout != null) connection.setReadTimeout(readTimeout);
            if (disableRedirects != null) connection.setDisableRedirects(disableRedirects);

            connection.setRequestHeaders(headers);
            return this;
        }

        public HookCapacitorHttpUrlConnection build() {
            return (HookCapacitorHttpUrlConnection) connection;
        }
    }
}
