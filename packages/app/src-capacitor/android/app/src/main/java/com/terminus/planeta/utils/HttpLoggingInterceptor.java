package com.terminus.planeta.utils;

import android.text.TextUtils;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.nio.charset.Charset;
import java.util.concurrent.TimeUnit;
import java.util.logging.Logger;

import androidx.annotation.IntDef;
import okhttp3.Connection;
import okhttp3.Headers;
import okhttp3.Interceptor;
import okhttp3.MediaType;
import okhttp3.Protocol;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import okhttp3.ResponseBody;
import okhttp3.internal.http.HttpHeaders;
import okio.Buffer;

/**
 * <pre>
 *     @author : zhangyuhang
 *     e-mail : zyh2433219116@gmail.com
 *     time   : 2020/12/01
 *     desc   : 日志拦截器 TODO 重复数据达到2条时不会打印（MarketKLine数据）
 *     version: 1.0
 * </pre>
 */
public class HttpLoggingInterceptor implements Interceptor {

    private static final Charset UTF8 = Charset.forName("UTF-8");
    private static final String LINE_SEPARATOR = System.getProperty("line.separator");

    //轮训的日志不打印，数据太多
    private static final String[] HTTP_LOG_SKIP = new String[]{"swap_info"};

    public static final int LEVEL_NONE     = 0;//不打印log
    public static final int LEVEL_BASIC    = 1;//只打印 请求首行 和 响应首行
    public static final int LEVEL_HEADERS  = 2;//打印请求和响应的所有 Header
    public static final int LEVEL_BODY     = 3;//所有数据全部打印

    @IntDef({LEVEL_NONE, LEVEL_BASIC, LEVEL_HEADERS,LEVEL_BODY})
    @Retention(RetentionPolicy.SOURCE)
    private @interface LevelType {
    }

    private volatile int printLevel = LEVEL_NONE;
    private java.util.logging.Level colorLevel;
    private Logger logger;

    public HttpLoggingInterceptor(String tag, @LevelType int type, java.util.logging.Level level) {
        logger = Logger.getLogger(tag);
        printLevel = type;
        colorLevel = level;
    }

    public void setPrintLevel(@LevelType int type) {
        printLevel = type;
    }

    public void setColorLevel(java.util.logging.Level level) {
        colorLevel = level;
    }

    private void log(String message) {
        logger.log(colorLevel, message);
    }

    @Override
    public Response intercept(Chain chain) throws IOException {
        Request request = chain.request();
        if (printLevel == LEVEL_NONE) {
            return chain.proceed(request);
        }

        int size = request.url().pathSegments().size();
        if (size >= 1) {
            String last = request.url().pathSegments().get(size - 1);
            for (String string : HTTP_LOG_SKIP) {
                if (string.equalsIgnoreCase(last)) {
                    return chain.proceed(request);
                }
            }
        }

        //请求日志拦截
        logForRequest(request, chain.connection());

        //执行请求，计算请求时间
        long startNs = System.nanoTime();
        Response response;
        try {
            response = chain.proceed(request);
        } catch (Exception e) {
            log("<-- HTTP FAILED: " + e);
            throw e;
        }
        long tookMs = TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - startNs);

        //响应日志拦截
        return logForResponse(response, tookMs);
    }

    private void logForRequest(Request request, Connection connection) throws IOException {
        boolean logBody = (printLevel == LEVEL_BODY);
        boolean logHeaders = (printLevel == LEVEL_BODY || printLevel == LEVEL_HEADERS);
        RequestBody requestBody = request.body();
        boolean hasRequestBody = requestBody != null;
        Protocol protocol = connection != null ? connection.protocol() : Protocol.HTTP_1_1;

        try {
            String requestStartMessage = "--> " + request.method() + ' ' + request.url() + ' ' + protocol;
            log(requestStartMessage);

            if (logHeaders) {
                if (hasRequestBody) {
                    // Request body headers are only present when installed as a network interceptor. Force
                    // them to be included (when available) so there values are known.
                    if (requestBody.contentType() != null) {
                        log("\nContent-Type: " + requestBody.contentType());
                    }
                    if (requestBody.contentLength() != -1) {
                        log("\nContent-Length: " + requestBody.contentLength());
                    }
                }
                Headers headers = request.headers();
                for (int i = 0, count = headers.size(); i < count; i++) {
                    String name = headers.name(i);
                    // Skip headers from the request body as they are explicitly logged above.
                    if (!"Content-Type".equalsIgnoreCase(name) && !"Content-Length".equalsIgnoreCase(name)) {
                        log("\n" + name + ": " + headers.value(i));
                    }
                }

                log("------------------------");
                if (logBody && hasRequestBody) {
                    log("isPlaintext(requestBody.contentType())=" + isPlaintext(requestBody.contentType()));
                    if (isPlaintext(requestBody.contentType())) {
                        bodyToString(request);
                    } else {
                        log("\nbody: maybe [binary body], omitted!");
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            log("-->Request END " + request.method());
            log(" ");
        }
    }

    private Response logForResponse(Response response, long tookMs) {
        Response.Builder builder = response.newBuilder();
        Response clone = builder.build();
        ResponseBody responseBody = clone.body();
        boolean logBody = (printLevel == LEVEL_BODY);
        boolean logHeaders = (printLevel == LEVEL_BODY || printLevel == LEVEL_HEADERS);

        try {
            log("<-- " + clone.code() + ' ' + clone.message() + ' ' + clone.request().url() + " (" + tookMs + "ms）");
            if (logHeaders) {
                Headers headers = clone.headers();
                for (int i = 0, count = headers.size(); i < count; i++) {
                    log("\n" + headers.name(i) + ": " + headers.value(i));
                }
                log("------------------------");
                if (logBody && HttpHeaders.hasBody(clone)) {
                    if (responseBody == null) return response;

                    if (isPlaintext(responseBody.contentType())) {
                        byte[] bytes = toByteArray(responseBody.byteStream());
                        MediaType contentType = responseBody.contentType();
                        String body = new String(bytes, getCharset(contentType));
                        printJson(body);
                        responseBody = ResponseBody.create(responseBody.contentType(), bytes);
                        return response.newBuilder().body(responseBody).build();
                    } else {
                        log("\nbody: maybe [binary body], omitted!");
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            log("<--Response END");
            log(" ");
        }
        return response;
    }

    private static Charset getCharset(MediaType contentType) {
        Charset charset = contentType != null ? contentType.charset(UTF8) : UTF8;
        if (charset == null) charset = UTF8;
        return charset;
    }

    /**
     * Returns true if the body in question probably contains human readable text. Uses a small sample
     * of code points to detect unicode control characters commonly used in binary file signatures.
     */
    private static boolean isPlaintext(MediaType mediaType) {
        if (mediaType == null) return false;
        if (mediaType.type() != null && mediaType.type().equals("text")) {
            return true;
        }
        String subtype = mediaType.subtype();
        if (subtype != null) {
            subtype = subtype.toLowerCase();
            return subtype.contains("x-www-form-urlencoded") || subtype.contains("json") || subtype.contains("xml") || subtype.contains("html");
        }
        return false;
    }

    private void bodyToString(Request request) {
        try {
            Request copy = request.newBuilder().build();
            RequestBody body = copy.body();
            if (body == null){
                return;
            }

            Buffer buffer = new Buffer();
            try {
                body.writeTo(buffer);
            } catch (IOException e) {
                e.printStackTrace();
            }
            MediaType contentType = body.contentType();
            String params = buffer.readString(getCharset(contentType)).replace("="," = ");
            if (!TextUtils.isEmpty(params)){
                printLine(true);
                String[] paramArray = new String[]{params};
                if (params.contains("&")) {
                    paramArray = params.split("&");
                }
                for (String param:paramArray) {
                    log("║ " + param);
                }
                printLine(false);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static byte[] toByteArray(InputStream input) throws IOException {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        write(input, output);
        output.close();
        return output.toByteArray();
    }

    public static void write(InputStream inputStream, OutputStream outputStream) throws IOException {
        int len;
        byte[] buffer = new byte[4096];
        while ((len = inputStream.read(buffer)) != -1) outputStream.write(buffer, 0, len);
    }

    private void printLine(boolean isTop) {
        if (isTop) {
            log("╔═══════════════════════════════════════════════════════════════════════════════════════");
        } else {
            log("╚═══════════════════════════════════════════════════════════════════════════════════════");
        }
    }

    private void printJson(String msg) {

        String message;

        try {
            if (msg.startsWith("{")) {
                JSONObject jsonObject = new JSONObject(msg);
                message = jsonObject.toString(4);//最重要的方法，就一行，返回格式化的json字符串，其中的数字4是缩进字符数
            } else if (msg.startsWith("[")) {
                JSONArray jsonArray = new JSONArray(msg);
                message = jsonArray.toString(4);
            } else {
                message = msg;
            }
        } catch (JSONException e) {
            message = msg;
        }

        printLine(true);
//        message = headString + LINE_SEPARATOR + message;
        String[] lines = message.split(LINE_SEPARATOR);
        for (String line : lines) {
            log("║ " + line);
        }
        printLine(false);
    }
}
