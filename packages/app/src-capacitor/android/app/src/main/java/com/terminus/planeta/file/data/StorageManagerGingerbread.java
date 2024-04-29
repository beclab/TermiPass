package com.terminus.planeta.file.data;

import android.os.StatFs;

import java.io.File;

/**
 * StorageManager implementation for pre-KitKat devices.
 */
public class StorageManagerGingerbread extends StorageManager {

    @Override
    protected File[] getSystemMediaDirs() {
        return new File[]{};
    }

    @Override
    protected File[] getSystemCacheDirs() {
        return new File[]{};
    }

    @Override
    protected long getStorageSize(File dir) {
        StatFs stat = new StatFs(dir.getParentFile().getAbsolutePath());
        return stat.getBlockCountLong() * stat.getBlockCountLong();
    }

    @Override
    protected long getStorageFreeSpace(File dir) {
        StatFs stat = new StatFs(dir.getParentFile().getAbsolutePath());
        return stat.getAvailableBlocksLong() * stat.getBlockSizeLong();
    }

    @Override
    public boolean supportsMultipleStorageLocations() {
        return false;
    }
}
