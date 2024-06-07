package com.terminus.planeta.file.account;

import android.os.Parcel;
import android.os.Parcelable;

import com.terminus.planeta.file.Utils;

public class Account implements Parcelable, Comparable<Account> {
    private static final String DEBUG_TAG = "Account";

    // The full URL of the server, like 'http://gonggeng.org/seahub/' or 'http://gonggeng.org/'
    public final String server;
    public final String name;

    public final String email;

    public final Boolean is_shib;

    public String sessionKey;

    public Account(String server, String email, String name, Boolean is_shib) {
        this.name = name;
        this.server = server;
        this.email = email;
        this.is_shib = is_shib;
    }

    public Account(String name, String server, String email, Boolean is_shib, String sessionKey) {
        this.server = server;
        this.name = name;
        this.email = email;
        this.sessionKey = sessionKey;
        this.is_shib = is_shib;
    }

    public String getServerHost() {
        String s = server.substring(server.indexOf("://") + 3);
        return s.indexOf('/') > 0 ? s.substring(0, s.indexOf('/')) : s;
    }

    public String getServerDomainName() {
        String dn = getServerHost();
        // strip port, like :8000 in 192.168.1.116:8000
        if (dn.contains(":")){
            dn = dn.substring(0, dn.indexOf(':'));
        }
        return dn;
    }

    public String getEmail() {
        return email;
    }

    public String getName(){
        return name;
    }
    public String getServer() {
        return server;
    }

    public String getServerNoProtocol() {
        String result = server.substring(server.indexOf("://") + 3);
        if (result.endsWith("/"))
            result = result.substring(0, result.length() - 1);
        return result;
    }

    public boolean isHttps() {
        return server.startsWith("https");
    }

    public boolean isShib() {
        return is_shib;
    }

    public String getSessionKey() {
        return sessionKey;
    }

    public void setSessionKey(String sessionKey) {
        this.sessionKey = sessionKey;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj)
            return true;
        if (obj == null || (obj.getClass() != this.getClass()))
            return false;

        Account a = (Account) obj;
        if (a.server == null || a.email == null )
            return false;

        return a.server.equals(this.server) && a.email.equals(this.email);
    }

    public String getSignature() {
        return String.format("%s (%s)", getServerNoProtocol(), email);
    }

    public String getDisplayName() {
        String server = Utils.stripSlashes(getServerHost());
        return Utils.assembleUserName(name, email, server);
    }

    @Override
    public int describeContents() {
        return 0;
    }

    @Override
    public void writeToParcel(Parcel out, int flags) {
        out.writeString(this.server);
        out.writeString(this.name);
        out.writeString(this.email);
        out.writeString(this.sessionKey);
        out.writeValue(this.is_shib);
    }

    public static final Creator<Account> CREATOR = new Creator<Account>() {
        @Override
        public Account createFromParcel(Parcel source) {
            return new Account(source);
        }

        @Override
        public Account[] newArray(int size) {
            return new Account[size];
        }
    };

    protected Account(Parcel in) {
        this.server = in.readString();
        this.name = in.readString();
        this.email = in.readString();
        this.sessionKey = in.readString();
        this.is_shib = (Boolean) in.readValue(Boolean.class.getClassLoader());

       // Log.d(DEBUG_TAG, String.format("%s %s %s %b", server, email, token ,is_shib));
    }

    @Override
    public String toString() {
        return "Account{" +
                "server='" + server + '\'' +
                ", name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", is_shib=" + is_shib +
                ", sessionKey='" + sessionKey + '\'' +
                '}';
    }

    @Override
    public int compareTo(Account other) {
        return this.toString().compareTo(other.toString());
    }
}
