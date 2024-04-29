import { IpcMainInvokeEvent, IpcRendererEvent } from 'electron';
import { IPCStoreEventName } from '../../src/platform/electron/interface';
import { ipcRendererInvoke, ipcRendererListener } from '../utils/preload';
import { ipcMainHandle } from '../utils/main';

export const ipcStoreRendererInvoke = <T>(
	eventName: IPCStoreEventName,
	...args: any[]
): Promise<T> => {
	return ipcRendererInvoke(eventName, ...args);
};

export const ipcStoreRendererListener = (
	eventName: IPCStoreEventName,
	callback: (event: IpcRendererEvent, ...args: any[]) => void
): void => {
	ipcRendererListener(eventName, callback);
};

export const ipcStoreMainHandle = <T>(
	eventName: IPCStoreEventName,
	listener: (event: IpcMainInvokeEvent, ...args: any[]) => Promise<T> | void | T
): void => {
	ipcMainHandle(eventName, listener);
};
