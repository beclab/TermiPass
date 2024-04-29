package com.terminus.planeta.autofill

import androidx.annotation.StringDef
import org.json.JSONObject

/**
 * <pre>
 *     @author : bytetrade
 *     e-mail : zyh2433219116@gmail.com
 *     time   : 2023/03/23
 *     desc   :
 *     version: 1.0
 * </pre>
 */
class SaveData(@SaveDataType val type: String, val data: SaveItemImpl)

const val CREDENTIAL_TYPE_LOGIN = "login"
const val CREDENTIAL_TYPE_CARD = "card"

@StringDef(value = [CREDENTIAL_TYPE_LOGIN, CREDENTIAL_TYPE_CARD])
@Retention(AnnotationRetention.SOURCE)
annotation class SaveDataType

interface SaveItemImpl {
    fun isValid(): Boolean
    fun opt(): String
}

class Login(val username: String?, val password: String?) : SaveItemImpl {
    override fun isValid(): Boolean {
        return !username.isNullOrBlank() && !password.isNullOrBlank()
    }

    override fun opt(): String {
        return JSONObject().apply {
            this.put("username", username ?: "")
            this.put("password", password ?: "")
        }.toString()
    }

    override fun toString(): String {
        return "Login(username=$username, password=$password)"
    }

}

