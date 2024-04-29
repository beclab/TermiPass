package com.terminus.planeta.accessibility

import android.os.Parcel
import android.os.Parcelable

/**
 * <pre>
 *     @author : bytetrade
 *     e-mail : zyh2433219116@gmail.com
 *     time   : 2023/02/03
 *     desc   :
 *     version: 1.0
 * </pre>
 */
open class AppCredential(
    val url: String?,
    val userName: String?,
    val password: String?
) : Parcelable {
    constructor(parcel: Parcel) : this(
        parcel.readString(),
        parcel.readString(),
        parcel.readString()
    )

    override fun writeToParcel(parcel: Parcel, flags: Int) {
        parcel.writeString(url)
        parcel.writeString(userName)
        parcel.writeString(password)
    }

    override fun describeContents(): Int {
        return 0
    }

    override fun toString(): String {
        return "Bean(url=$url, userName=$userName, password=$password)"
    }

    companion object CREATOR : Parcelable.Creator<AppCredential> {
        override fun createFromParcel(parcel: Parcel): AppCredential {
            return AppCredential(parcel)
        }

        override fun newArray(size: Int): Array<AppCredential?> {
            return arrayOfNulls(size)
        }
    }


}