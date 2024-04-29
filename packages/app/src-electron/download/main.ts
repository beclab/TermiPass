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
	updatePreventSleepTask('download', length > 0);
});

let newDownloadItem: INewDownloadFile | null;

let win: BrowserWindow | null;

const tempDownloadItemIds: string[] = [];

export const registerDownloadService = () => {
	listenerEvent();
};

export const resetWin = (setWin: BrowserWindow) => {
	win = setWin;
};

const listenerEvent = () => {
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
	}
	session.defaultSession.on('will-download', listenerDownload);
};

const downloadFile = (newItem: INewDownloadFile) => {
	const { url, fileName, path: savePath } = newItem;
	const newFileName = getFileName(fileName ?? '', url);
	let downloadPath = pathJoin(savePath, newFileName);
	const existItem = isExistItem(url, downloadItemData.array);

	newItem.fileName = newFileName;
	newItem.path = downloadPath;

	const info = getFileInfo(newFileName);
	let number = 1;
	while (isExistFile(downloadPath)) {
		const saveFilePathName =
			info.realname +
			`(${number})` +
			(info.ext.length > 0 ? `${info.ext}` : '');
		downloadPath = pathJoin(savePath, saveFilePathName);
		number += 1;
	}

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

const removeDownloadItem = (item: IDownloadFile) => {
	const sourceItem = getDownloadItem(downloadItemData.array, item.id);
	const index = downloadItemData.array.findIndex((e) => (e.id = item.id));
	if (index >= 0) {
		downloadItemData.splice(index, 1);
	}
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

export const listenerDownload = async (
	_event: Event,
	item: DownloadItem,
	webContents: WebContents
): Promise<void> => {
	if (!newDownloadItem) return;
	let prevReceivedBytes = 0;
	item.setSavePath(currentSavePath());
	const downloadItem: IDownloadFile = await addDownloadItem({
		item,
		downloadIds: tempDownloadItemIds,
		data: downloadItemData,
		newDownloadItem
	});
	ipcDownloadMainSend(webContents, 'newDownloadItem', {
		...downloadItem,
		_sourceItem: null
	});

	item.on('updated', (_e, state) => {
		const receivedBytes = updateDownloadItem({
			item,
			downloadItem,
			data: downloadItemData,
			prevReceivedBytes,
			state
		});
		prevReceivedBytes = receivedBytes;
		const bytes = getDownloadBytes(downloadItemData.array);
		win?.setProgressBar(bytes.receivedBytes / bytes.totalBytes);
		ipcDownloadMainSend(webContents, 'downloadItemUpdate', {
			...downloadItem,
			_sourceItem: null
		});
	});

	item.on('done', (_e, state) => {
		downloadItem.state = state;
		if (state === 'cancelled' || state === 'interrupted') {
			/* empty */
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
	if (process.platform === 'darwin') {
		app.dock.downloadFinished(downloadItem.to);
	}
	removeDownload(downloadItemData, downloadItem.id);
	downloadItem.receivedBytes = item.getReceivedBytes();
	downloadItem.totalBytes = item.getTotalBytes();
	downloadItem.leftTimes = 0;
	downloadItem.endTime = Date.now();

	setDownloadStore(downloadItemData.array);

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
