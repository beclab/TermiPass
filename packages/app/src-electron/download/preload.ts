import { IpcRendererEvent } from 'electron';
import {
	IDownloadFile,
	INewDownloadFile,
	ipcDownloadRendererInvoke,
	ipcDownloadRendererListener
} from './interface';

/**
 * 获取下载路径
 */
export const getDownloadPath = (): Promise<string> =>
	ipcDownloadRendererInvoke('getDownloadPath');

/**
 * 设置下载路径
 */
export const setDownloadPath = (path: string): Promise<boolean> =>
	ipcDownloadRendererInvoke('setDownloadPath', path);

export const selectDownloadPath = (): Promise<string> =>
	ipcDownloadRendererInvoke('selectDownloadPath');

/**
 * 新建下载项
 * @param formData - 下载数据
 */
export const newDownloadFile = (
	formData: INewDownloadFile
): Promise<IDownloadFile | null> =>
	ipcDownloadRendererInvoke<IDownloadFile | null>('newDownloadFile', formData);

/**
 * 重新下载
 */
// export const retryDownloadFile = (item: IDownloadFile): Promise<boolean> =>
// 	ipcDownloadRendererInvoke('retryDownloadFile', item);

/**
 * 打开选择保存位置对话框
 * @param path - 路径
 */
// export const openFileDialog = (path: string): Promise<string> =>
// 	ipcDownloadRendererInvoke('openFileDialog', path);

/**
 * 暂停或恢复下载
 * @param item - 下载项
 */
export const pauseOrResume = (item: IDownloadFile): Promise<IDownloadFile> =>
	ipcDownloadRendererInvoke('pauseOrResume', item);

export const allPauseOrResume = (
	pause: boolean,
	list: string[]
): Promise<boolean> =>
	ipcDownloadRendererInvoke('allPauseOrResume', pause, list);

/**
 * 删除下载项。下载中的将先取消，再删除
 * @param item - 下载项
 * @param index - 下载项的下标
 */
export const removeDownloadItem = (
	item: IDownloadFile
): Promise<IDownloadFile> =>
	ipcDownloadRendererInvoke('removeDownloadItem', item);

export const removeAllDownloadItems = (list: string[]): Promise<boolean> =>
	ipcDownloadRendererInvoke('removeAllDownloadItems', list);

/**
 * 清空下载完成项
 */
// export const clearDownloadDone = (): Promise<IDownloadFile[]> =>
// 	ipcDownloadRendererInvoke('clearDownloadDone');

/**
 * 监听新建下载项事件
 * @param callback - 回调函数
 */
export const listenerNewDownloadItem = (
	callback: (event: IpcRendererEvent, ...args: any[]) => void
): void => ipcDownloadRendererListener('newDownloadItem', callback);

/**
 * 监听下载项更新事件
 * @param callback - 回调函数
 */
export const listenerDownloadItemUpdate = (
	callback: (event: IpcRendererEvent, ...args: any[]) => void
): void => ipcDownloadRendererListener('downloadItemUpdate', callback);

/**
 * 监听下载项完成事件
 * @param callback - 回调函数
 */
export const listenerDownloadItemDone = (
	callback: (event: IpcRendererEvent, ...args: any[]) => void
): void => ipcDownloadRendererListener('downloadItemDone', callback);

export const registerDownloadMethods = {
	getDownloadPath,
	setDownloadPath,
	newDownloadFile,
	// retryDownloadFile,
	// openFileDialog,
	pauseOrResume,
	allPauseOrResume,
	removeDownloadItem,
	removeAllDownloadItems,
	// clearDownloadDone,
	listenerNewDownloadItem,
	listenerDownloadItemUpdate,
	listenerDownloadItemDone,
	selectDownloadPath
};
