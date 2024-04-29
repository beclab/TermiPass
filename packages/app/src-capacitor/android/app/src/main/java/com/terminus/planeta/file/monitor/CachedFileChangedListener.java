package com.terminus.planeta.file.monitor;

import com.terminus.planeta.file.account.Account;
import com.terminus.planeta.file.data.SeafCachedFile;

import java.io.File;

interface CachedFileChangedListener {
    void onCachedBlocksChanged(Account account, SeafCachedFile cf, File file);

    void onCachedFileChanged(Account account, SeafCachedFile cf, File file);
}

