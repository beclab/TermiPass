package com.terminus.planeta.file.monitor;

import com.terminus.planeta.file.SettingsManager;
import com.terminus.planeta.file.account.Account;

class AutoUpdateInfo {
    final Account account;
    final String repoID;
    final String repoName;
    final String parentDir;
    final String localPath;

    public AutoUpdateInfo(Account account, String repoID, String repoName, String parentDir,
                          String localPath) {

        this.account = account;
        this.repoID = repoID;
        this.repoName = repoName;
        this.parentDir = parentDir;
        this.localPath = localPath;
    }

    public boolean canLocalDecrypt() {
        return SettingsManager.instance().isEncryptEnabled();
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj)
            return true;
        if (obj == null || (obj.getClass() != this.getClass()))
            return false;

        AutoUpdateInfo that = (AutoUpdateInfo) obj;
        if(that.account == null || that.repoID == null || that.repoName == null || that.parentDir == null || that.localPath == null) {
            return false;
        }

        return that.account.equals(this.account) && that.repoID.equals(this.repoID) &&
                that.repoName.equals(this.repoName) && that.parentDir.equals(this.parentDir) &&
                that.localPath.equals(this.localPath);
    }

    private volatile int hashCode = 0;
}
