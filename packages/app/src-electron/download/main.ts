import {
	session,
	app,
	BrowserWindow,
	DownloadItem,
	WebContents,
	dialog
} from 'electron';

import {
	IDownloadFile,
	INewDownloadFile,
	ipcDownloadMainHandle,
	ipcDownloadMainSend
} from './interface';

import { getFileInfo, getFileName, isExistFile, pathJoin } from '../utils';
import {
	addDownloadItem,
	// deleteSourceItem,
	download,
	getDownloadBytes,
	getDownloadItem,
	isExistItem,
	setDownloadStore,
	setTaskbar,
	updateDownloadItem,
	removeDownload,
	ObservableArray
} from './helper';

import stores from '../store/electron-store';

import { addTransferHistory } from '../transfer/main';

import { updatePreventSleepTask } from '../settings/main';

const downloadItemData: ObservableArray<IDownloadFile> = new ObservableArray();

downloadItemData.on('change', (length: number) => {
	console.log(`Array length changed to ${length}`);
	updatePreventSleepTask('download', length > 0);
});

let newDownloadItem: INewDownloadFile | null;

let win: BrowserWindow | null;

const tempDownloadItemIds: string[] = []; // 下载中的 id

export const registerDownloadService = () => {
	listenerEvent();
};

export const resetWin = (setWin: BrowserWindow) => {
	win = setWin;
};

// 添加主进程 ipc 调用事件
const listenerEvent = () => {
	// 新建下载

	downloadItemData.reset(
		stores.store.get(
			stores.createKeyWithUser(stores.DOWNLOAD_HISTORY),
			[]
		) as IDownloadFile[]
	);

	ipcDownloadMainHandle('getDownloadPath', () => currentSavePath());

	ipcDownloadMainHandle('selectDownloadPath', async () => {
		const result = await dialog.showOpenDialog({
			properties: ['openDirectory'],
			title: 'Please select the download directory',
			buttonLabel: 'Select',
			defaultPath: currentSavePath()
		});
		return result && result.filePaths && result.filePaths.length > 0
			? result.filePaths[0]
			: currentSavePath();
	});

	ipcDownloadMainHandle('setDownloadPath', (_event, path: string) => {
		stores.store.set(stores.createKeyWithUser(stores.DOWNLOAD_SAVE_PATH), path);
		return true;
	});

	ipcDownloadMainHandle('newDownloadFile', (_event, data: INewDownloadFile) =>
		downloadFile(data)
	);
	// 重新下载
	// ipcDownloadMainHandle('retryDownloadFile', (_event, data: IDownloadFile) =>
	// 	retryDownloadFile(data)
	// );

	// // 选择保存位置对话框
	// ipcDownloadMainHandle('openFileDialog', (_event, oldPath?: string) =>
	// 	openFileDialog(oldPath)
	// );

	// // 打开文件
	// ipcDownloadMainHandle('openFile', (_event, path: string) => openFile(path));

	// // 打开文件所在路径
	// ipcDownloadMainHandle('openFileInFolder', (_event, path: string) =>
	// 	openFileInFolder(path)
	// );

	// 暂停或恢复下载
	ipcDownloadMainHandle('pauseOrResume', (_event, item: IDownloadFile) =>
		pauseOrResume(item)
	);

	ipcDownloadMainHandle(
		'allPauseOrResume',
		(_event, pause: boolean, list: string[]) => {
			downloadItemData.array.forEach((item) => {
				if (list.length > 0) {
					if (list.findIndex((e) => e == item.id) >= 0) {
						pauseOrResume(item, pause == true ? 0 : 1);
					}
				} else {
					pauseOrResume(item, pause == true ? 0 : 1);
				}
			});

			return true;
		}
	);

	// 清空已完成（非下载中的）的下载项
	// ipcDownloadMainHandle('clearDownloadDone', () => clearDownloadDone());

	// 删除下载项
	ipcDownloadMainHandle('removeDownloadItem', (_event, item: IDownloadFile) =>
		removeDownloadItem(item)
	);

	ipcDownloadMainHandle('removeAllDownloadItems', (_event, list: string[]) =>
		removeAllDownloadItems(list)
	);

	if (downloadItemData.array.length > 0) {
		downloadItemData.array.forEach((item) => {
			retryDownloadFile({
				...item,
				_sourceItem: undefined
			});
		});
		console.log('downloadItemData ====>');

		console.log(downloadItemData);
	}

	// 调用 download 方法后，触发 will-download 事件
	session.defaultSession.on('will-download', listenerDownload);
};

/**
 * 下载文件
 * @param newItem - 新下载项
 */
const downloadFile = (newItem: INewDownloadFile) => {
	const { url, fileName, path: savePath } = newItem;
	const newFileName = getFileName(fileName ?? '', url); // 处理文件名

	// 处理保存路径
	let downloadPath = pathJoin(savePath, newFileName);
	// 查找下载记录中是否存在历史下载
	const existItem = isExistItem(url, downloadItemData.array);

	newItem.fileName = newFileName;
	newItem.path = downloadPath;

	// 判断是否存在
	const info = getFileInfo(newFileName);
	let number = 1;
	console.log('downloadPath 1===>');
	console.log(downloadPath);

	while (isExistFile(downloadPath)) {
		const saveFilePathName =
			info.realname +
			`(${number})` +
			(info.ext.length > 0 ? `${info.ext}` : '');
		downloadPath = pathJoin(savePath, saveFilePathName);
		number += 1;
	}
	console.log('downloadPath 2===>');
	console.log(downloadPath);

	if (existItem) {
		removeDownloadItem(existItem as IDownloadFile);
		existItem.to = downloadPath;
		retryDownloadFile({
			...existItem,
			...newItem,
			_sourceItem: undefined,
			speed: 0,
			progress: 0,
			receivedBytes: 0,
			paused: false,
			state: 'progressing'
		});
		return null;
	}

	newDownloadItem = {
		url,
		fileName: newFileName,
		path: downloadPath,
		totalBytes: newItem.totalBytes
	};

	download(url, win);
	return null;
};

/**
 * 重新下载
 * @param data - 下载项
 */
const retryDownloadFile = (data: IDownloadFile): boolean => {
	newDownloadItem = {
		fileName: data.fileName,
		path: data.to,
		url: data.from,
		totalBytes: data.totalBytes
	};
	tempDownloadItemIds.push(data.id);
	download(data.from, win);
	return true;
};

/**
 * 打开文件选择框
 * @param oldPath - 上一次打开的路径
 */
// const openFileDialog = async (oldPath: string = app.getPath('downloads')) => {
// 	if (!win) return oldPath;

// 	const { canceled, filePaths } = await dialog.showOpenDialog(win, {
// 		title: '选择保存位置',
// 		properties: ['openDirectory', 'createDirectory'],
// 		defaultPath: oldPath
// 	});

// 	return !canceled ? filePaths[0] : oldPath;
// };

/**
 * 暂停或恢复
 * @param item - 下载项
 */
const pauseOrResume = (item: IDownloadFile, pauseOrResume = -1) => {
	const sourceItem = getDownloadItem(downloadItemData.array, item.id);
	if (!sourceItem) return item;

	if (pauseOrResume == -1) {
		if (item.paused) {
			sourceItem.resume();
		} else {
			sourceItem.pause();
		}
	} else {
		if (pauseOrResume == 0) {
			if (!item.paused) {
				sourceItem.pause();
			}
		} else {
			if (item.paused) {
				sourceItem.resume();
			}
		}
	}

	item.paused = sourceItem.isPaused();
	setDownloadStore(downloadItemData.array);
	return item;
};

/**
 * 清空已完成的下载项
 */
// const clearDownloadDone = () => {
// 	downloadItemData = downloadItemData.filter(
// 		(item) => item.state === 'progressing'
// 	);

// 	setDownloadStore(downloadItemData);
// 	return deleteSourceItem(downloadItemData);
// };

/**
 * 移除下载项。下载中会取消下载
 * @param item - 下载项
 * @param index - 下载项的下标
 */
const removeDownloadItem = (item: IDownloadFile) => {
	const sourceItem = getDownloadItem(downloadItemData.array, item.id);
	const index = downloadItemData.array.findIndex((e) => (e.id = item.id));
	if (index >= 0) {
		downloadItemData.splice(index, 1);
	}
	// 如果下载项的状态是下载中，需要取消
	if (item.state === 'progressing') {
		sourceItem && sourceItem.cancel();
	}

	setDownloadStore(downloadItemData.array);
	return item;
};

const removeAllDownloadItems = (list: string[]) => {
	const allItems = downloadItemData.array;
	allItems.forEach((item) => {
		if (list.length > 0) {
			if (list.findIndex((e) => e == item.id) >= 0) {
				removeDownloadItem(item);
			}
		} else {
			removeDownloadItem(item);
		}
	});
	return true;
};

/**
 * 监听下载
 * @param _event - electron 事件
 * @param item - 下载项
 * @param webContents - webContents
 */
export const listenerDownload = async (
	_event: Event,
	item: DownloadItem,
	webContents: WebContents
): Promise<void> => {
	// 新建下载为空时，会执行 electron 默认的下载处理
	if (!newDownloadItem) return;

	let prevReceivedBytes = 0; // 记录上一次下载的字节数据

	// 设置下载项的保存地址
	item.setSavePath(currentSavePath());
	// 添加下载项
	const downloadItem: IDownloadFile = await addDownloadItem({
		item,
		downloadIds: tempDownloadItemIds,
		data: downloadItemData,
		newDownloadItem
	});
	// setTaskbar(downloadItemData, downloadCompletedIds, -1, win);
	// 新下载任务创建完成，渲染进程监听该事件，添加到下载管理器列表
	ipcDownloadMainSend(webContents, 'newDownloadItem', {
		...downloadItem,
		_sourceItem: null
	});

	// 更新下载
	item.on('updated', (_e, state) => {
		console.log('updated');
		console.log(state);

		const receivedBytes = updateDownloadItem({
			item,
			downloadItem,
			data: downloadItemData,
			prevReceivedBytes,
			state
		});
		prevReceivedBytes = receivedBytes;

		// 获取所有下载中的接受字节和总字节数据
		const bytes = getDownloadBytes(downloadItemData.array);
		// 更新任务栏进度
		win?.setProgressBar(bytes.receivedBytes / bytes.totalBytes);
		// 通知渲染进程，更新下载状态
		ipcDownloadMainSend(webContents, 'downloadItemUpdate', {
			...downloadItem,
			_sourceItem: null
		});
	});

	// 下载完成
	item.on('done', (_e, state) => {
		downloadItem.state = state;
		// 下载成功
		if (state === 'cancelled' || state === 'interrupted') {
			console.log('download status ===>', state);
		} else if (state === 'completed') {
			finishedDownload(downloadItem, item, webContents);
		}
		setTaskbar(downloadItemData.array, 0, win);
	});

	if (downloadItem.state === 'completed') {
		finishedDownload(downloadItem, item, webContents);
	}
};

const finishedDownload = (
	downloadItem: IDownloadFile,
	item: DownloadItem,
	webContents: WebContents
) => {
	// 下载成功
	if (process.platform === 'darwin') {
		app.dock.downloadFinished(downloadItem.to);
	}
	removeDownload(downloadItemData, downloadItem.id);
	downloadItem.receivedBytes = item.getReceivedBytes();
	downloadItem.totalBytes = item.getTotalBytes();
	downloadItem.leftTimes = 0;
	downloadItem.endTime = Date.now();

	setDownloadStore(downloadItemData.array);

	// 通知渲染进程，更新下载状态
	const update = {
		...downloadItem,
		_sourceItem: null
	};
	ipcDownloadMainSend(webContents, 'downloadItemDone', update);
	addTransferHistory(update);
};

const currentSavePath = () => {
	return stores.store.get(
		stores.createKeyWithUser(stores.DOWNLOAD_SAVE_PATH),
		app.getPath('downloads')
	) as string;
};
