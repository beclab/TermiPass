package com.terminus.planeta.autofill

import android.app.assist.AssistStructure
import android.os.Build
import android.service.autofill.SaveInfo.SAVE_DATA_TYPE_GENERIC
import android.service.autofill.SaveInfo.SAVE_DATA_TYPE_PASSWORD
import android.text.InputType
import android.util.Log
import android.view.View
import android.view.autofill.AutofillId
import androidx.annotation.RequiresApi
import com.terminus.planeta.utils.Constants

/**
 * <pre>
 *     @author : bytetrade
 *     e-mail : zyh2433219116@gmail.com
 *     time   : 2023/02/15
 *     desc   : 把一组 ViewNode 提取的对象获取所有hint类型提取 为自填做准备
 *     version: 1.0
 * </pre>
 */
@RequiresApi(Build.VERSION_CODES.O)
class FieldCollection {

    private var passwordFields: MutableList<Field>? = null
    private var usernameFields: MutableList<Field>? = null
    val fieldList: MutableList<Field> = mutableListOf()
    val fieldHintMap: MutableMap<String, MutableList<Field>> = mutableMapOf()
    var saveType: Int = SAVE_DATA_TYPE_GENERIC
        get() {
            if (fillableForLogin()) {
                return SAVE_DATA_TYPE_PASSWORD
            }
            return SAVE_DATA_TYPE_GENERIC
        }

    val ignoreSearchTerms = mutableListOf("search", "find", "recipient", "edit")
    val passwordTerms = mutableListOf("password", "pswd")
    val ignoreAutoIdList: MutableList<AutofillId> = mutableListOf()

    fun parseNode(node: AssistStructure.ViewNode) {
        val hints = node.autofillHints
        Log.i(Constants.TAG_FRAMEWORK, "node : className  ${node.className} ${node.hint}")
        val isEditText = node.className == Constants.ANDROID_SYSTEM_EDIT_VIEW ||
                node.className == Constants.ANDROID_SYSTEM_AUTO_COMPLETE_TEXTVIEW ||
                node.htmlInfo?.tag == Constants.ANDROID_WEB_INPUT_HTML_TAG
        if (isEditText || (hints?.isNotEmpty() == true)) {
            add(Field(node))
        } else {
            ignore(node)
        }
    }

    private fun add(field: Field) {
        if (fieldList.contains(field)) {
            return
        }

        passwordFields = null
        usernameFields = null

        fieldList.add(field)

        if (field.autofillHints != null) {
            field.autofillHints.forEach {
                if (!fieldHintMap.containsKey(it)) {
                    fieldHintMap[it] = mutableListOf()
                }
                fieldHintMap[it]!!.add(field)
            }
        }
    }

    private fun ignore(node: AssistStructure.ViewNode) {
        if (node.autofillId != null) {
            ignoreAutoIdList.add(node.autofillId!!)
        }
    }

    fun getPasswordFields(): MutableList<Field>? {
        if (passwordFields != null) {
            return passwordFields
        }
        if (fieldHintMap.any()) {
            passwordFields = mutableListOf();
            if (fieldHintMap.containsKey(View.AUTOFILL_HINT_PASSWORD)) {
                passwordFields?.addAll(fieldHintMap[View.AUTOFILL_HINT_PASSWORD] as Collection<Field>);
            }
        } else {
            passwordFields = fieldList.filter {
                fieldIsPassword(it)
            }.toMutableList()
            if (passwordFields == null) {
                passwordFields = fieldList.filter {
                    fieldHasPasswordTerms(it)
                }.toMutableList()
            }
        }
        return passwordFields
    }

    fun getUsernameFields(): MutableList<Field>? {
        if (usernameFields != null) {
            return usernameFields
        }
        usernameFields = mutableListOf()
        if (fieldHintMap.any()) {
            if (fieldHintMap.containsKey(View.AUTOFILL_HINT_EMAIL_ADDRESS)) {
                usernameFields?.addAll(fieldHintMap[View.AUTOFILL_HINT_EMAIL_ADDRESS] as Collection<Field>);
            }
            if (fieldHintMap.containsKey(View.AUTOFILL_HINT_USERNAME)) {
                usernameFields?.addAll(fieldHintMap[View.AUTOFILL_HINT_USERNAME] as Collection<Field>);
            }
        } else {
            getPasswordFields()?.forEach {
                val usernameField =
                    fieldList.takeWhile { filed -> filed.autofillId != it.autofillId }.lastOrNull()
                if (usernameField != null) {
                    usernameFields?.add(usernameField)
                }
            }
        }
        return usernameFields
    }

    fun getFieldAutofillIds(): MutableList<AutofillId> {
        val array = mutableListOf<AutofillId>();
        fieldList.forEach {
            array.add(it.autofillId!!)
        }
        return array
    }

    private fun focusedHintsContain(hints: List<String>): Boolean {
        var hasValue = false;
        hints.forEach {
            if (fieldHintMap.containsKey(it)) {
                hasValue = true
            }
        }
        return hasValue
    }

    private fun fillableForLogin(): Boolean {
        return focusedHintsContain(
            listOf(
                View.AUTOFILL_HINT_USERNAME,
                View.AUTOFILL_HINT_EMAIL_ADDRESS,
                View.AUTOFILL_HINT_PASSWORD
            )
        ) || (if (getUsernameFields() != null) getUsernameFields()!!.any { it.focused } else false)
                || (if (getPasswordFields() != null) getPasswordFields()!!.any { it.focused } else false)
    }

    fun fillable() : Boolean = fillableForLogin()

    fun getSavedData(): SaveData? {
        if (saveType == SAVE_DATA_TYPE_PASSWORD) {
            val data = Login(
                usernameFields?.first { field ->
                    !field.getValue().isNullOrBlank()
                }?.getValue(),
                passwordFields?.first { field ->
                    !field.getValue().isNullOrBlank()
                }?.getValue(),
            )
            if (data.isValid()) {
                return SaveData(CREDENTIAL_TYPE_LOGIN, data)
            }
        }

        return null
    }

    fun getRequiredSaveFields(): List<AutofillId?>? {
        if (saveType == SAVE_DATA_TYPE_PASSWORD) {
            return getPasswordFields()?.map {
                it.autofillId
            }
        }

        return listOf<AutofillId>()
    }

    fun getOptionalSaveIds(): List<AutofillId?>? {
        if (saveType == SAVE_DATA_TYPE_PASSWORD) {
            return getUsernameFields()?.map {
                it.autofillId
            }
        }
        return listOf<AutofillId>()
    }

    fun getFirstNotPwdFiled(): Field? {
        fieldHintMap.forEach {
            if (it.key != View.AUTOFILL_HINT_PASSWORD) {
                return it.value[0]
            }
        }
        return null
    }

    private fun getFieldValueByHint(hint: String): String? {
        if (fieldHintMap.containsKey(hint)) {
            fieldHintMap[hint]?.forEach {
                val value = it.getValue()
                if (!value.isNullOrBlank()) {
                    return value
                }
            }
        }
        return null
    }

    fun getFirstUserNameField(): Field? {
        if (fieldHintMap.containsKey(View.AUTOFILL_HINT_USERNAME)) {
            return fieldHintMap[View.AUTOFILL_HINT_USERNAME]!![0]
        }
        return null
    }

    fun fieldIsPassword(field: Field): Boolean {
        var inputTypePassword = field.hasInputFlag(InputType.TYPE_TEXT_VARIATION_PASSWORD) ||
                field.hasInputFlag(InputType.TYPE_TEXT_VARIATION_VISIBLE_PASSWORD) ||
                field.hasInputFlag(InputType.TYPE_TEXT_VARIATION_WEB_PASSWORD)

        // For whatever reason, multi-line input types are coming through with TextVariationPassword flags
        if (inputTypePassword && field.hasInputFlag(InputType.TYPE_TEXT_VARIATION_PASSWORD) &&
            field.hasInputFlag(InputType.TYPE_TEXT_FLAG_MULTI_LINE)
        ) {
            inputTypePassword = false
        }

        if (!inputTypePassword &&
            field.htmlInfo != null &&
            field.htmlInfo.tag == Constants.ANDROID_WEB_INPUT_HTML_TAG &&
            field.htmlInfo.attributes?.any() == true
        ) {
            field.htmlInfo.attributes?.forEach {
                val key = if (it.first.isNullOrBlank()) "" else it.first as String
                val value = if (it.second.isNullOrBlank()) "" else it.second as String
                if (key == "type" && value == "password") {
                    return true
                }
            }
        }

        return inputTypePassword && !valueContainsAnyTerms(field.idEntry, ignoreSearchTerms) &&
                !valueContainsAnyTerms(field.hint, ignoreSearchTerms);
    }

    private fun fieldHasPasswordTerms(field: Field): Boolean {
        return valueContainsAnyTerms(field.idEntry, passwordTerms) || valueContainsAnyTerms(
            field.hint,
            passwordTerms
        );
    }

    private fun valueContainsAnyTerms(value: String?, terms: MutableList<String>): Boolean {
        if (value.isNullOrBlank()) {
            return false
        }
        val lowerValue = value.lowercase()
        return terms.any {
            lowerValue.contains(it)
        };
    }
}