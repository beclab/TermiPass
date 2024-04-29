package com.terminus.planeta.file.data;

import com.terminus.planeta.file.Utils;

import java.io.File;

public class SeafCachedFile implements SeafItem {
    public int id;
    public String fileID;
    public String repoName;
    public String repoID;
    public String path;
    public String accountSignature;
    public long fileOriginalSize;
    protected File file;

    public SeafCachedFile() {
        id = -1;
    }

    @Override
    public String getTitle() {
        return path.substring(path.lastIndexOf('/') + 1);
    }

    @Override
    public String getSubtitle() {
        return Utils.readableFileSize(file.length());
    }

    @Override
    public int getIcon() {
        return Utils.getFileIcon(file.getName());
    }

    public long getSize() {
        return file.length();
    }

    public long getLastModified() {
        return file.lastModified();
    }

    public boolean isDirectory() {
        return file.isDirectory();
    }

    public String getAccountSignature() {
        return accountSignature;
    }

    public long getFileOriginalSize() {
        return fileOriginalSize;
    }

    public void setFileOriginalSize(long fileOriginalSize) {
        this.fileOriginalSize = fileOriginalSize;
    }

    public String getFileUri(){
        return "file://" + file.getAbsolutePath();
    }

    @Override
    public String toString() {
        return "SeafCachedFile{" +
                "id=" + id +
                ", fileID='" + fileID + '\'' +
                ", repoName='" + repoName + '\'' +
                ", repoID='" + repoID + '\'' +
                ", path='" + path + '\'' +
                ", accountSignature='" + accountSignature + '\'' +
                ", fileOriginalSize=" + fileOriginalSize +
                ", file=" + file +
                '}';
    }
}
