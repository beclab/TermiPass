package com.terminus.planeta.plugins;

import com.getcapacitor.Bridge;
import com.getcapacitor.JSObject;
import com.getcapacitor.JSValue;
import com.getcapacitor.PluginCall;
import com.getcapacitor.plugin.util.HttpRequestHandler;
import com.terminus.planeta.utils.LoggerUtils;

import org.json.JSONException;

import java.io.IOException;
import java.lang.reflect.Method;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.Locale;
import java.util.logging.Level;

/**
 * <pre>
 *     @author : bytetrade
 *     e-mail : zyh2433219116@gmail.com
 *     time   : 2023/11/13
 *     desc   :
 *     version: 1.0
 * </pre>
 */
class HookHttpRequestHandler {

    /**
     * Makes an Http Request based on the PluginCall parameters
     * @param call The Capacitor PluginCall that contains the options need for an Http request
     * @param httpMethod The HTTP method that overrides the PluginCall HTTP method
     * @throws IOException throws an IO request when a connection can't be made
     * @throws URISyntaxException thrown when the URI is malformed
     * @throws JSONException thrown when the incoming JSON is malformed
     */
    public static JSObject request(PluginCall call, String httpMethod, Bridge bridge)
            throws IOException, URISyntaxException, JSONException {
        String urlString = call.getString("url", "");
        JSObject headers = call.getObject("headers", new JSObject());
        JSObject params = call.getObject("params", new JSObject());
        Integer connectTimeout = call.getInt("connectTimeout");
        Integer readTimeout = call.getInt("readTimeout");
        Boolean disableRedirects = call.getBoolean("disableRedirects");
        Boolean shouldEncode = call.getBoolean("shouldEncodeUrlParams", true);
        HttpRequestHandler.ResponseType responseType = HttpRequestHandler.ResponseType.parse(call.getString("responseType"));
        String dataType = call.getString("dataType");

        LoggerUtils log = new LoggerUtils("TermiPass Http Request", Level.INFO);
        log.printLog("url",urlString);
        log.printJson("headers",headers.toString());
        log.printJson("params",params.toString());
        log.printLog("dataType",dataType);

        String method = httpMethod != null ? httpMethod.toUpperCase(Locale.ROOT) : call.getString("method", "GET").toUpperCase(Locale.ROOT);

        log.printLog("method",method);

        boolean isHttpMutate = method.equals("DELETE") || method.equals("PATCH") || method.equals("POST") || method.equals("PUT");

        boolean hideCookie = params.optBoolean("hideCookie",false);
        params.remove("hideCookie");

        URL url = new URL(urlString);
        HookCapacitorHttpUrlConnection.HookHttpURLConnectionBuilder connectionBuilder = new HookCapacitorHttpUrlConnection.HookHttpURLConnectionBuilder();

        connectionBuilder.setUrl(url);
        connectionBuilder.setMethod(method);
        connectionBuilder.setHeaders(headers);
        connectionBuilder.setUrlParams(params, shouldEncode);
        connectionBuilder.setConnectTimeout(connectTimeout);
        connectionBuilder.setReadTimeout(readTimeout);
        connectionBuilder.setDisableRedirects(disableRedirects);
        connectionBuilder.openConnection();

        HookCapacitorHttpUrlConnection connection = connectionBuilder.build();
        if (hideCookie){
            // 设置请求头，携带 cookie
            connection.setRequestProperty("Cookie", "");
        }

        if (null != bridge && !isDomainExcludedFromSSL(bridge, url)) {
            connection.setSSLSocketFactory(bridge);
        }

        // Set HTTP body on a non GET or HEAD request
        if (isHttpMutate) {
            JSValue data = new JSValue(call, "data");
            if (data.getValue() != null) {
                log.printLog("data",data.toString());
                connection.setDoOutput(true);
                connection.setRequestBody(call, data, dataType);
            }
        }

        connection.connect();

        return HttpRequestHandler.buildResponse(connection, responseType);
    }

    private static Boolean isDomainExcludedFromSSL(Bridge bridge, URL url) {
        try {
            Class<?> sslPinningImpl = Class.forName("io.ionic.sslpinning.SSLPinning");
            Method method = sslPinningImpl.getDeclaredMethod("isDomainExcluded", Bridge.class, URL.class);
            return (Boolean) method.invoke(sslPinningImpl.newInstance(), bridge, url);
        } catch (Exception ignored) {
            return false;
        }
    }
}
