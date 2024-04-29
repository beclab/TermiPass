package com.terminus.planeta.autofill

import android.app.assist.AssistStructure
import android.os.Build
import android.view.View
import android.view.autofill.AutofillValue
import androidx.annotation.RequiresApi

/**
 * <pre>
 *     @author : bytetrade
 *     e-mail : zyh2433219116@gmail.com
 *     time   : 2023/02/14
 *     desc   : 把单个 ViewNode 提取有效字段 封装成一个对象
 *     version: 1.0
 * </pre>
 */
@RequiresApi(Build.VERSION_CODES.O)
class Field(private val node: AssistStructure.ViewNode) {

    val id = "${node.id}_${node.hashCode()}"
    val autofillType = node.autofillType
    val focused = node.isFocused
    val autofillId = node.autofillId
    val inputType = node.inputType
    val htmlInfo = node.htmlInfo
    val hint = node.hint
    val idEntry = node.idEntry

    val autofillHints = node.autofillHints?.filter {
        isValidHint(it)
    }

    private var textValue: String? = null
    private var dateValue: Long? = null
    private var listValue: Int? = null
    private var toggleValue: Boolean? = null

    init {
        setValue()
    }

    /**
     * 过滤有效hint字段
     */
    private fun isValidHint(hint: String): Boolean {
        return when (hint) {
            View.AUTOFILL_HINT_NAME,
            View.AUTOFILL_HINT_USERNAME,
            View.AUTOFILL_HINT_PASSWORD,
            View.AUTOFILL_HINT_PHONE,
            View.AUTOFILL_HINT_EMAIL_ADDRESS,
            View.AUTOFILL_HINT_CREDIT_CARD_NUMBER ->
                true
            else -> false
        }
    }

    private fun setValue() {
        if (node.autofillValue != null) {
            if (node.autofillValue!!.isList) {
                val autofillOptions = node.autofillOptions
                if (autofillOptions != null && autofillOptions.isNotEmpty()) {
                    listValue = node.autofillValue!!.listValue;
                    textValue = autofillOptions[node.autofillValue!!.listValue].toString()
                }
            } else if (node.autofillValue!!.isDate) {
                dateValue = node.autofillValue!!.dateValue;
            } else if (node.autofillValue!!.isText) {
                textValue = node.autofillValue!!.textValue.toString()
            } else if (node.autofillValue!!.isToggle) {
                toggleValue = node.autofillValue!!.toggleValue;
            }
        }
    }

    fun getValue(): String? {
        if (!textValue.isNullOrBlank()) {
            if (autofillType == View.AUTOFILL_TYPE_LIST && listValue != null) {
                return listValue.toString()
            }
            return textValue.toString()
        } else if (dateValue != null) {
            return dateValue.toString()
        } else if (toggleValue != null) {
            return toggleValue.toString()
        }
        return null;
    }

    /**
     * 根据自填类型 将value 转化为 autofillValue 准备setValue填入
     */
    fun getAutofillValue(value : String): AutofillValue? {
        return when (autofillType) {
            View.AUTOFILL_TYPE_DATE ->
                AutofillValue.forDate(value.toLong())
            View.AUTOFILL_TYPE_LIST -> {
                if (autofillHints != null) {
                    for (i in autofillHints.indices){
                        if (autofillHints[i].equals(value)) {
                            return AutofillValue.forList(i)
                        }
                    }
                }
                return null
            }
            View.AUTOFILL_TYPE_TEXT ->
                return AutofillValue.forText(value);
            View.AUTOFILL_TYPE_TOGGLE ->{
                AutofillValue.forToggle(value.toBoolean());
            }
            else -> return null
        }
    }

    fun hasInputFlag(flag : Int) : Boolean{
        return this.inputType and flag == flag
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as Field

        if (node != other.node) return false
        if (id != other.id) return false
        if (autofillType != other.autofillType) return false

        return true
    }

    override fun hashCode(): Int {
        var result = node.hashCode()
        result = 31 * result + id.hashCode()
        result = 31 * result + autofillType
        return result
    }

    override fun toString(): String {
        return "Field(focused=$focused, inputType=$inputType, htmlInfo=$htmlInfo, hint=$hint, idEntry=$idEntry, autofillHints=$autofillHints)"
    }

}