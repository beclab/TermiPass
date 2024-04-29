import {
	DownloadItem,
	IpcMainInvokeEvent,
	IpcRendererEvent,
	WebContents
} from 'electron';
import {
	DownloadItemState,
	ITransferDownloadFile as IDownloadFileInterface,
	INewDownloadFile as INewDownloadFileInterface,
	ITransferFile as ITransferFileInterface,
	IPCDownloadEventName
} from '../../src/platform/electron/interface';
import { ipcMainHandle, ipcWebContentsSend } from '../utils/main';
import { ipcRendererInvoke, ipcRendererListener } from '../utils/preload';
import { ObservableArray } from './helper';

export interface IAddDownloadItem {
	item: DownloadItem;
	downloadIds: string[];
	data: ObservableArray<IDownloadFile>;
	newDownloadItem: INewDownloadFile | null;
}

export interface IUpdateDownloadItem {
	item: DownloadItem;
	data: ObservableArray<IDownloadFile>;
	downloadItem: IDownloadFile;
	prevReceivedBytes: number;
	state: DownloadItemState;
}

export interface IDownloadBytes {
	receivedBytes: number;
	totalBytes: number;
}

export interface IDownloadBGFile extends IDownloadFileInterface {
	_sourceItem: DownloadItem | undefined;
}

export type IDownloadFile = IDownloadBGFile;
export type IITransferFile = ITransferFileInterface;

export type INewDownloadFile = INewDownloadFileInterface;

export const ipcDownloadRendererInvoke = <T>(
	eventName: IPCDownloadEventName,
	...args: any[]
): Promise<T> => {
	return ipcRendererInvoke(eventName, ...args);
};

export const ipcDownloadRendererListener = (
	eventName: IPCDownloadEventName,
	callback: (event: IpcRendererEvent, ...args: any[]) => void
): void => {
	ipcRendererListener(eventName, callback);
};

/* main */
/**
 * 添加 ipc 调用的处理事件
 * @param eventName - ipc 事件名
 * @param listener - 回调事件
 */
export const ipcDownloadMainHandle = <T>(
	eventName: IPCDownloadEventName,
	listener: (event: IpcMainInvokeEvent, ...args: any[]) => Promise<T> | void | T
): void => {
	ipcMainHandle(eventName, listener);
};

export const ipcDownloadMainSend = (
	webContents: WebContents,
	eventName: IPCDownloadEventName,
	...args: any[]
) => {
	ipcWebContentsSend(webContents, eventName, ...args);
};
