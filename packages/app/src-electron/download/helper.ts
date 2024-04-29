import { BrowserWindow, DownloadItem, app } from 'electron';
import {
	IAddDownloadItem,
	IDownloadBytes,
	IDownloadFile,
	IITransferFile,
	IUpdateDownloadItem
} from './interface';
import { getBase64Bytes, getFileIcon, getFileName, uuidV4 } from '../utils';
import stores from '../store/electron-store';
import { TransferFront } from '../../src/platform/electron/interface';
import EventEmitter from 'events';

export class ObservableArray<T> extends EventEmitter {
	array: T[] = [];
	constructor() {
		super();
	}

	push(value: T) {
		this.array.push(value);
		this.emit('change', this.array.length);
	}

	reset(value: T[]) {
		this.array = value;
		this.emit('change', this.array.length);
	}

	splice(index: number, length: number) {
		const item = this.array.splice(index, length);
		this.emit('change', this.array.length);
		return item;
	}

	unshift(value: T) {
		const length = this.array.unshift(value);
		this.emit('change', this.array.length);
		return length;
	}
}

/**
 * 是否存在下载项
 * @param url - 下载地址
 * @param data - 下载记录
 */
export const isExistItem = (
	url: string,
	data: IITransferFile[]
): IITransferFile | null => {
	const item = data.filter((d) => d.from === url);

	return item.length ? item[0] : null;
};

export const download = (url: string, win: BrowserWindow | null): void => {
	if (!win) return;
	win.webContents.downloadURL(url);
};

export const getDownloadItem = (
	data: IDownloadFile[],
	id: string
): DownloadItem | null => {
	const newData = data.filter((item) => item.id === id);

	if (!newData.length) return null;
	return newData[0]?._sourceItem || null;
};

export const setDownloadStore = (data: IDownloadFile[]): void => {
	stores.store.set(stores.createKeyWithUser(stores.DOWNLOAD_HISTORY), data);
};

export const deleteSourceItem = (data: IDownloadFile[]): IDownloadFile[] => {
	data = data.map((item) => ({ ...item, _sourceItem: undefined }));
	return data;
};

export const getDownloadIndex = (data: IDownloadFile[], id: string): number =>
	data.findIndex((item) => item.id === id);

export const addDownloadItem = async ({
	item,
	downloadIds,
	data,
	newDownloadItem
}: IAddDownloadItem): Promise<IDownloadFile> => {
	const id = downloadIds.shift() || '';
	const itemIndex = getDownloadIndex(data.array, id);

	const fileUrl = item.getURL();
	const fileName = getFileName(
		newDownloadItem?.fileName || '',
		item.getFilename()
	);
	const startTime = item.getStartTime() * 1000;
	let totalBytes = getBase64Bytes(fileUrl) || item.getTotalBytes();
	if (totalBytes == 0) {
		totalBytes = newDownloadItem?.totalBytes || 0;
	}
	let fileId = uuidV4();
	const savePath = newDownloadItem?.path || app.getPath('downloads');

	if (itemIndex > -1) {
		const newItems = data.splice(itemIndex, 1);
		const newItem = newItems[0];

		fileId = newItem.id;
		if (newItem.paused) {
			item.pause();
		}
	}

	item.setSavePath(savePath);

	const fileIcon = await getFileIcon(savePath);
	const downloadItem: IDownloadFile = {
		id: fileId,
		icon: fileIcon,
		fileName,
		to: savePath,
		state: item.getState(),
		startTime,
		speed: 0,
		progress: 0,
		totalBytes,
		receivedBytes: item.getReceivedBytes(),
		paused: item.isPaused(),
		_sourceItem: item,
		front: TransferFront.download,
		from: fileUrl,
		endTime: 0,
		openPath: '',
		leftTimes: -1
	};

	data.unshift(downloadItem);

	setDownloadStore(data.array);

	newDownloadItem = null;

	return downloadItem;
};
export const setTaskbar = (
	data: IDownloadFile[],
	progress: number,
	win: BrowserWindow | null
): void => {
	const count = data.length;

	if (win) {
		win.setProgressBar(count < 1 ? -1 : progress);
	}

	if (process.platform === 'darwin') {
		app.badgeCount = count;
	}
};

export const updateDownloadItem = ({
	item,
	downloadItem,
	data,
	prevReceivedBytes,
	state
}: IUpdateDownloadItem): number => {
	const receivedBytes = item.getReceivedBytes();

	if (downloadItem.totalBytes == 0) {
		downloadItem.totalBytes = item.getTotalBytes();
	}

	downloadItem.receivedBytes = receivedBytes;
	downloadItem.speed = receivedBytes - prevReceivedBytes;

	downloadItem.progress = receivedBytes / downloadItem.totalBytes;
	downloadItem.state = state;
	downloadItem.paused = item.isPaused();

	if (
		downloadItem.totalBytes > 0 &&
		downloadItem.totalBytes > downloadItem.receivedBytes
	) {
		downloadItem.leftTimes =
			(downloadItem.totalBytes - downloadItem.receivedBytes) /
			downloadItem.speed;
	} else {
		if (downloadItem.totalBytes > 0) {
			downloadItem.leftTimes = 0;
		}
	}

	setDownloadStore(data.array);
	return receivedBytes;
};

export const getDownloadBytes = (data: IDownloadFile[]): IDownloadBytes => {
	const allBytes = data.reduce<IDownloadBytes>(
		(prev, current) => {
			if (current.state === 'progressing') {
				prev.receivedBytes += current.receivedBytes;
				prev.totalBytes += current.totalBytes;
			}

			return prev;
		},
		{ receivedBytes: 0, totalBytes: 0 }
	);

	return allBytes;
};

export const removeDownload = (
	data: ObservableArray<IDownloadFile>,
	id: string
) => {
	const index = data.array.findIndex((item) => item.id === id);

	if (index >= 0) {
		data.splice(index, 1);
	}

	return data;
};
