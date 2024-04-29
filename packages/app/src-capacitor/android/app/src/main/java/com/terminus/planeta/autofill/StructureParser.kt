package com.terminus.planeta.autofill

import android.app.assist.AssistStructure
import android.os.Build
import androidx.annotation.RequiresApi
import com.terminus.planeta.utils.Constants

/**
 * 解析结点 抛出所有结点
 *      并获取结点的包名和网站
 */
@RequiresApi(Build.VERSION_CODES.O)
class StructureParser constructor(private val structures: MutableList<AssistStructure>) {

    private var packageName: String? = null
    private var webSite: String? = null
    private val removePackageList = mutableListOf("android")
    private var collection: FieldCollection? = null

    constructor(structure: AssistStructure) : this(mutableListOf(structure))

    fun getPackageName(): String? {
        return packageName
    }

    fun getCollection(): FieldCollection {
        if (collection == null){
            throw Exception("parse node first")
        }
        return collection!!
    }

    fun getUri(): String? {
        if (webSite != null) {
            return webSite
        }
        if (packageName != null) {
            return Constants.ANDROID_APPLICATION_PREFIX + packageName;
        }
        return null
    }

    fun parse(processor: NodeProcessor?) {
        collection = FieldCollection()

        for (structure in structures) {
            val nodes: Int = structure.windowNodeCount
            for (i in 0 until nodes) {
                val viewNode: AssistStructure.ViewNode = structure.getWindowNodeAt(i).rootViewNode
                traverseRoot(viewNode, processor)
            }
        }

        if (!AutofillHelper.compatBrowsers.contains(packageName) && !AutofillHelper.trustedBrowsers.contains(packageName)){
            webSite = null
        }
    }

    private fun traverseRoot(viewNode: AssistStructure.ViewNode, processor: NodeProcessor?) {
        //自己做些事情
        parseNodeUri(viewNode)
        collection?.parseNode(viewNode)

        //抛给外边做些事情
        processor?.processNode(viewNode)
        val childrenSize: Int = viewNode.childCount
        if (childrenSize > 0) {
            for (i in 0 until childrenSize) {
                traverseRoot(viewNode.getChildAt(i), processor)
            }
        }
    }

    private fun parseNodeUri(viewNode: AssistStructure.ViewNode) {
        if (packageName.isNullOrBlank() && !viewNode.idPackage.isNullOrBlank() &&
            !removePackageList.contains(viewNode.idPackage)
        ) {
            packageName = viewNode.idPackage
        }
        if (webSite.isNullOrBlank() && !viewNode.webDomain.isNullOrBlank()) {
            var scheme = "http"
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P && viewNode.webScheme != null) {
                scheme = viewNode.webScheme!!
            }
            webSite = String.format("{0}://{1}", scheme, viewNode.webDomain)
        }
    }

    /**
     * processor contains action to be performed on each [ViewNode].
     */
    interface NodeProcessor {
        fun processNode(node: AssistStructure.ViewNode)
    }
}