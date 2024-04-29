package com.terminus.planeta.plugins;

/**
 * <pre>
 *     @author : bytetrade
 *     e-mail : zyh2433219116@gmail.com
 *     time   : 2022/12/30
 *     desc   : https://github.com/jenly1314/ZXingLite/blob/08f0294b1d48c6c712215a9835fcd930bd261c1d/zxing-lite/src/main/java/com/king/zxing/util/CodeUtils.java
 *     version: 1.0
 * </pre>
 */

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Base64;
import android.util.Log;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.BinaryBitmap;
import com.google.zxing.DecodeHintType;
import com.google.zxing.LuminanceSource;
import com.google.zxing.MultiFormatReader;
import com.google.zxing.RGBLuminanceSource;
import com.google.zxing.Result;
import com.google.zxing.common.GlobalHistogramBinarizer;
import com.google.zxing.common.HybridBinarizer;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import androidx.annotation.NonNull;

import static java.util.Collections.singletonList;

@CapacitorPlugin(name = "ScanPhotoQR")
public class ScanPhotoQRPlugin extends Plugin {

    private static final int DEFAULT_REQ_WIDTH = 480;
    private static final int DEFAULT_REQ_HEIGHT = 640;
    private static final String TAG = ScanPhotoQRPlugin.class.getSimpleName();


    @PluginMethod
    public void scan(PluginCall call) {
        String base64Content = call.getString("content", "");
        Log.d(TAG, "base64Content:" + base64Content);
        if (!Objects.equals(base64Content, "")) {
            Bitmap bitmap = stringToBitmap(base64Content);
            if (bitmap != null) {
                Result result = parseCodeResult(bitmap);
                String code = result == null ? "" : result.getText();
                Log.d(TAG, "code:" + code);
                JSObject jsObject = new JSObject();
                JSArray jsArray = new JSArray();
                jsArray.put(code);
                jsObject.put("result", jsArray);
                call.resolve(jsObject);
            }
        }
    }

    private static Bitmap stringToBitmap(String base64Data) {
        Bitmap bitmap = null;
        try {
            byte[] bytes = Base64.decode(base64Data, Base64.DEFAULT);
            bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.length);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return bitmap;
    }

    /**
     * 解析二维码图片
     *
     * @param bitmapPath 需要解析的图片路径
     */
    public static String parseQRCode(String bitmapPath) {
        Result result = parseQRCodeResult(bitmapPath);
        if (result != null) {
            return result.getText();
        }
        return null;
    }

    /**
     * 解析二维码图片
     *
     * @param bitmapPath 需要解析的图片路径
     * @return
     */
    public static Result parseQRCodeResult(String bitmapPath) {
        return parseQRCodeResult(bitmapPath, DEFAULT_REQ_WIDTH, DEFAULT_REQ_HEIGHT);
    }

    /**
     * 解析二维码图片
     *
     * @param bitmapPath 需要解析的图片路径
     * @param reqWidth   请求目标宽度，如果实际图片宽度大于此值，会自动进行压缩处理，当 reqWidth 和 reqHeight都小于或等于0时，则不进行压缩处理
     * @param reqHeight  请求目标高度，如果实际图片高度大于此值，会自动进行压缩处理，当 reqWidth 和 reqHeight都小于或等于0时，则不进行压缩处理
     */
    private static Result parseQRCodeResult(String bitmapPath, int reqWidth, int reqHeight) {
        return parseCodeResult(bitmapPath, reqWidth, reqHeight, createDecodeHint(BarcodeFormat.QR_CODE));
    }

    /**
     * 支持解码的格式
     *
     * @param barcodeFormat {@link BarcodeFormat}
     */
    private static Map<DecodeHintType, Object> createDecodeHint(@NonNull BarcodeFormat barcodeFormat) {
        Map<DecodeHintType, Object> hints = new EnumMap<>(DecodeHintType.class);
        addDecodeHintTypes(hints, singletonList(barcodeFormat));
        return hints;
    }

    /**
     * @param hints
     * @param formats
     */
    private static void addDecodeHintTypes(Map<DecodeHintType, Object> hints, List<BarcodeFormat> formats) {
        // Image is known to be of one of a few possible formats.
        hints.put(DecodeHintType.POSSIBLE_FORMATS, formats);
        // Spend more time to try to find a barcode; optimize for accuracy, not speed.
        hints.put(DecodeHintType.TRY_HARDER, Boolean.TRUE);
        // Specifies what character encoding to use when decoding, where applicable (type String)
        hints.put(DecodeHintType.CHARACTER_SET, "UTF-8");
    }

    /**
     * 解析一维码/二维码图片
     *
     * @param bitmapPath 需要解析的图片路径
     * @param reqWidth   请求目标宽度，如果实际图片宽度大于此值，会自动进行压缩处理，当 reqWidth 和 reqHeight都小于或等于0时，则不进行压缩处理
     * @param reqHeight  请求目标高度，如果实际图片高度大于此值，会自动进行压缩处理，当 reqWidth 和 reqHeight都小于或等于0时，则不进行压缩处理
     * @param hints      解析编码类型
     * @return Result
     */
    public static Result parseCodeResult(String bitmapPath, int reqWidth, int reqHeight, Map<DecodeHintType, Object> hints) {
        return parseCodeResult(compressBitmap(bitmapPath, reqWidth, reqHeight), hints);
    }

    /**
     * 解析一维码/二维码图片
     *
     * @param bitmap 解析的图片
     * @return Result
     */
    public static Result parseCodeResult(Bitmap bitmap) {
        return parseCodeResult(getRGBLuminanceSource(bitmap), new EnumMap<>(DecodeHintType.class));
    }


    /**
     * 解析一维码/二维码图片
     *
     * @param bitmap 解析的图片
     * @param hints  解析编码类型
     * @return Result
     */
    public static Result parseCodeResult(Bitmap bitmap, Map<DecodeHintType, Object> hints) {
        return parseCodeResult(getRGBLuminanceSource(bitmap), hints);
    }

    /**
     * 压缩图片
     *
     * @param path FilePath
     * @return Bitmap
     */
    private static Bitmap compressBitmap(String path, int reqWidth, int reqHeight) {
        if (reqWidth > 0 && reqHeight > 0) {//都大于进行判断是否压缩

            BitmapFactory.Options newOpts = new BitmapFactory.Options();
            // 开始读入图片，此时把options.inJustDecodeBounds 设回true了
            newOpts.inJustDecodeBounds = true;//获取原始图片大小
            BitmapFactory.decodeFile(path, newOpts);// 此时返回bm为空
            float width = newOpts.outWidth;
            float height = newOpts.outHeight;
            // 缩放比，由于是固定比例缩放，只用高或者宽其中一个数据进行计算即可
            int wSize = 1;// wSize=1表示不缩放
            if (width > reqWidth) {// 如果宽度大的话根据宽度固定大小缩放
                wSize = (int) (width / reqWidth);
            }
            int hSize = 1;// wSize=1表示不缩放
            if (height > reqHeight) {// 如果高度高的话根据宽度固定大小缩放
                hSize = (int) (height / reqHeight);
            }
            int size = Math.max(wSize, hSize);
            if (size <= 0)
                size = 1;
            newOpts.inSampleSize = size;// 设置缩放比例
            // 重新读入图片，注意此时已经把options.inJustDecodeBounds 设回false了
            newOpts.inJustDecodeBounds = false;

            return BitmapFactory.decodeFile(path, newOpts);

        }

        return BitmapFactory.decodeFile(path);
    }

    /**
     * 获取RGBLuminanceSource
     *
     * @param bitmap
     * @return
     */
    private static RGBLuminanceSource getRGBLuminanceSource(@NonNull Bitmap bitmap) {
        int width = bitmap.getWidth();
        int height = bitmap.getHeight();

        int[] pixels = new int[width * height];
        bitmap.getPixels(pixels, 0, bitmap.getWidth(), 0, 0, bitmap.getWidth(), bitmap.getHeight());
        return new RGBLuminanceSource(width, height, pixels);
    }


    /**
     * 解析一维码/二维码图片
     *
     * @param source
     * @param hints
     * @return
     */
    public static Result parseCodeResult(LuminanceSource source, Map<DecodeHintType, Object> hints) {
        Result result = null;
        MultiFormatReader reader = new MultiFormatReader();
        try {
            reader.setHints(hints);
            if (source != null) {
                result = decodeInternal(reader, source);
                if (result == null) {
                    result = decodeInternal(reader, source.invert());
                }
                if (result == null && source.isRotateSupported()) {
                    result = decodeInternal(reader, source.rotateCounterClockwise());
                }
            }

        } catch (Exception e) {
            Log.w(TAG, e.getMessage());
        } finally {
            reader.reset();
        }

        return result;
    }

    private static Result decodeInternal(MultiFormatReader reader, LuminanceSource source) {
        Result result = null;
        try {
            try {
                //采用HybridBinarizer解析
                result = reader.decodeWithState(new BinaryBitmap(new HybridBinarizer(source)));
            } catch (Exception e) {

            }
            if (result == null) {
                //如果没有解析成功，再采用GlobalHistogramBinarizer解析一次
                result = reader.decodeWithState(new BinaryBitmap(new GlobalHistogramBinarizer(source)));
            }
        } catch (Exception e) {

        }
        return result;
    }

}
