import { IpcMainInvokeEvent, IpcRendererEvent } from 'electron';
import { ipcMainHandle } from '../utils/main';
import { ipcRendererInvoke, ipcRendererListener } from '../utils/preload';
import { IPCTransferEventName } from '../../src/platform/electron/interface';
import {
	ITransferFile as TransferFile,
	ITransferDownloadFile as TransferDownloadFile,
	ITransferUploadFile as TransferUploadFile
} from '../../src/platform/electron/interface';

export const ipcTransferRendererInvoke = <T>(
	eventName: IPCTransferEventName,
	...args: any[]
): Promise<T> => {
	return ipcRendererInvoke(eventName, ...args);
};

export const ipcTransferRendererListener = (
	eventName: IPCTransferEventName,
	callback: (event: IpcRendererEvent, ...args: any[]) => void
): void => {
	ipcRendererListener(eventName, callback);
};

/**
 * 添加 ipc 调用的处理事件
 * @param eventName - ipc 事件名
 * @param listener - 回调事件
 */
export const ipcTransferMainHandle = <T>(
	eventName: IPCTransferEventName,
	listener: (event: IpcMainInvokeEvent, ...args: any[]) => Promise<T> | void | T
): void => {
	ipcMainHandle(eventName, listener);
};

export type ITransferFile = TransferFile;
export type ITransferDownloadFile = TransferDownloadFile;
export type ITransferUploadFile = TransferUploadFile;
