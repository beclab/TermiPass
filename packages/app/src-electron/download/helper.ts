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

/**
 * 下载
 * @param win - 窗口
 * @param url - 下载地址
 */
export const download = (url: string, win: BrowserWindow | null): void => {
	if (!win) return;
	console.log('start download');
	win.webContents.downloadURL(url);
};

/**
 * 获取下载项
 * @param data - 下载记录
 * @param id - 下载项 id
 */
export const getDownloadItem = (
	data: IDownloadFile[],
	id: string
): DownloadItem | null => {
	const newData = data.filter((item) => item.id === id);

	if (!newData.length) return null;
	return newData[0]?._sourceItem || null;
};

/**
 * 保存下载记录
 * @param data - 下载项
 */
export const setDownloadStore = (data: IDownloadFile[]): void => {
	stores.store.set(stores.createKeyWithUser(stores.DOWNLOAD_HISTORY), data);
	console.log(data);
};

/**
 * 移除下载数据中的 _sourceItem 属性
 * @param data - 下载数据
 */
export const deleteSourceItem = (data: IDownloadFile[]): IDownloadFile[] => {
	data = data.map((item) => ({ ...item, _sourceItem: undefined }));
	return data;
};

/**
 * 获取下载项下标
 * @param data - 下载记录
 * @param id - 下载项 id
 */
export const getDownloadIndex = (data: IDownloadFile[], id: string): number =>
	data.findIndex((item) => item.id === id);

/**
 * 添加下载项
 * @param param
 */
export const addDownloadItem = async ({
	item,
	downloadIds,
	data,
	newDownloadItem
}: IAddDownloadItem): Promise<IDownloadFile> => {
	const id = downloadIds.shift() || '';
	// 判断下载项是否存在，存在先移除，再添加
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
	console.log('totalBytes ===>', totalBytes);
	console.log(item);

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

	// 阻止系统保存对话框
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
	// 清空缓存数据
	newDownloadItem = null;

	return downloadItem;
};

/**
 * 设置任务栏
 */
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

/**
 * 更新下载中数据
 * @param item - 下载项，electron 生成的对象
 * @param downloadItem - 更新的下载项
 * @param prevReceivedBytes - 上一次下载字节数
 * @param state - 下载状态
 */
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
	// 计算每秒下载的速度
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

/**
 * 获取下载中的字节数据
 * @param data - 下载项
 */
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
