import { PluginListenerHandle } from '@capacitor/core';

export declare type onUploadSuccess = () => void;

export declare type onDownloadSuccess = (options: {
	path: string;
	fileId: string;
	local: string;
}) => void;

export enum SeaHubType {
	file = 'file',
	dir = 'dir'
}
export interface SeaFile {
	id: string;
	mtime: number;
	name: string;
	parent_dir: string;
	permission: string;
	starred: false;
	type: SeaHubType;
}
export interface SeafilePlugin {
	startTransfer(): void;
	setUser(options: { server: string; name: string; email: string }): void;
	downloadFiles(options: {
		repoId: string;
		repoName: string;
		dirPath: string;
		dirents: SeaFile[];
	}): void;
	downloadFile(options: {
		repoId: string;
		repoName: string;
		//文件夹路径
		dirPath: string;
		fileName: string;
	}): Promise<void>;
	uploadFile(options: {
		names: string[];
		repoId: string;
		repoName: string;
		dirPath: string;
		dirID: string;
		dirPermission: string;
	}): void;

	addListener(
		eventName: 'uploadSuccess',
		listenerFunc: onUploadSuccess
	): Promise<PluginListenerHandle> & PluginListenerHandle;

	addListener(
		eventName: 'downloadSuccess',
		listenerFunc: onDownloadSuccess
	): Promise<PluginListenerHandle> & PluginListenerHandle;

	getCacheFile(options: {
		repoId: string;
		repoName: string;
		path: string;
		fileID: string;
	}): Promise<{ path: string }>;
	openLocalFile(options: {
		repoId: string;
		repoName: string;
		path: string;
		fileID: string;
	}): void;
}
