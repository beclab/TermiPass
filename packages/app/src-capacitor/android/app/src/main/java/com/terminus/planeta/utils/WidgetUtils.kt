import android.app.Activity
import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.webkit.MimeTypeMap
import android.widget.Toast
import androidx.core.content.FileProvider
import com.terminus.planeta.R
import com.terminus.planeta.file.Utils
import java.io.File
import java.util.Locale

/**
 * <pre>
 *     @author : bytetrade
 *     e-mail : zyh2433219116@gmail.com
 *     time   : 2023/08/24
 *     desc   :
 *     version: 1.0
 * </pre>
 */
object WidgetUtils {

    private val MIME_ANDROID = "application/vnd.android.package-archive"


    /**
     * display the file according to its file type
     *
     * @param file
     */
    @JvmStatic
    fun showFileProvider(activity: Activity, file: File) {
        val name = file.name
        val suffix = name.substring(name.lastIndexOf('.') + 1).lowercase(Locale.getDefault())
        //Open markdown and txt files in MarkdownActivity
        val isTextMime: Boolean = Utils.isTextMimeType(name)
        var mime = MimeTypeMap.getSingleton().getMimeTypeFromExtension(suffix)
        if (mime == null && isTextMime) {
            mime = "text/*" // set .md  .markdown .txt file type//
        } else if (mime == null) {
            mime = "*/*" // forces app chooser dialog on unknown type//
        }
        if (MIME_ANDROID == mime) {
//            showFileForAndroid(activity,file,name);
            return
        }
        val open = Intent(Intent.ACTION_VIEW)
        open.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        if (Build.VERSION.SDK_INT > 23) {
            val photoURI: Uri = FileProvider.getUriForFile(
                activity,
                activity.applicationContext.packageName + ".FileProvider",
                file
            )
            open.setDataAndType(photoURI, mime)
            open.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION)
        } else {
            open.setDataAndType(Uri.fromFile(file), mime)
        }
        if (Build.VERSION.SDK_INT < 30) {
            if (activity.packageManager.resolveActivity(open, 0) == null) {
                val message: String = java.lang.String.format(
                    activity.getString(R.string.op_exception_suitable_app_not_found),
                    mime
                )
                Toast.makeText(activity, message, Toast.LENGTH_SHORT).show();
                mime = "*/*"
                open.type = mime
            }
        }
        try {
            activity.startActivity(open)
        } catch (e: ActivityNotFoundException) {
            e.printStackTrace()
        }
    }
}