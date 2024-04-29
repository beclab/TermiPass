import {
	ITransferDownloadFile,
	ITransferFile,
	ITransferUploadFile,
	ipcTransferRendererInvoke
} from './interface';

/**
 * 获取下载路径
 */
export const getDownloadData = (): Promise<ITransferDownloadFile[]> =>
	ipcTransferRendererInvoke('getDownloadData');

export const getUploadData = (): Promise<ITransferUploadFile[]> =>
	ipcTransferRendererInvoke('getUploadData');

export const getCompleteData = (): Promise<ITransferFile[]> =>
	ipcTransferRendererInvoke('getCompleteData');

export const clearCompleteData = (list: string[]): Promise<boolean> =>
	ipcTransferRendererInvoke('clearCompleteData', list);

/**
 * 打开文件
 * @param path - 路径
 */
export const openFile = (path: string): Promise<boolean> =>
	ipcTransferRendererInvoke('openFile', path);

/**
 * 打开文件所在位置
 * @param path - 路径
 */
export const openFileInFolder = (path: string): Promise<boolean> =>
	ipcTransferRendererInvoke('openFileInFolder', path);

export const registerTransferMethods = {
	getDownloadData,
	getUploadData,
	getCompleteData,
	clearCompleteData,
	openFile,
	openFileInFolder
};
