package com.terminus.planeta.file.data;

public interface ProgressMonitor {
    void onProgressNotify(long total, boolean updateTotal);

    boolean isCancelled();
}
