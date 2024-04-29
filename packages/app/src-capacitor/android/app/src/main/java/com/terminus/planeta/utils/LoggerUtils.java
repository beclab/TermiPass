package com.terminus.planeta.utils;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.logging.Logger;

/**
 * <pre>
 *     @author : zhangyuhang
 *     e-mail : zyh2433219116@gmail.com
 *     time   : 2023/08/22
 *     desc   : 日志工具
 *     version: 1.0
 * </pre>
 */
public class LoggerUtils {

    private static final Charset UTF8 = StandardCharsets.UTF_8;
    public static final String LINE_SEPARATOR = System.getProperty("line.separator");

    private java.util.logging.Level colorLevel;
    private Logger logger;

    public LoggerUtils(String tag, java.util.logging.Level level) {
        logger = Logger.getLogger(tag);
        colorLevel = level;
    }

    private void log(String message) {
        logger.log(colorLevel,"║ " +  message);
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
            logger.log(colorLevel,"╔═══════════════════════════════════════════════════════════════════════════════════════");
        } else {
            logger.log(colorLevel,"╚═══════════════════════════════════════════════════════════════════════════════════════");
        }
    }

    private void printType(String type){
        logger.log(colorLevel,"====> " +  type);
    }

    public void printJson(String type,String msg) {

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

        printType(type);
        printLine(true);
        String[] lines = message.split(LINE_SEPARATOR);
        for (String line : lines) {
            log(line);
        }
        printLine(false);
    }

    public void printLog(String type,String msg){
        printType(type);
        printLine(true);
        log(msg);
        printLine(false);
    }
}
