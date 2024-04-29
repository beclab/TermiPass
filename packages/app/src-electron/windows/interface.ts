import { IpcMainInvokeEvent, IpcRendererEvent, BrowserWindow } from 'electron';
import { ipcRendererInvoke, ipcRendererListener } from '../utils/preload';
import { ipcMainHandle, ipcMainSend } from '../utils/main';
import { IPCWindowsHeaderMenusEventName } from '../../src/platform/electron/interface';

export const ipcWindowsRendererInvoke = <T>(
	eventName: IPCWindowsHeaderMenusEventName,
	...args: any[]
): Promise<T> => {
	return ipcRendererInvoke(eventName, ...args);
};

export const ipcWindowsRendererListener = (
	eventName: IPCWindowsHeaderMenusEventName,
	callback: (event: IpcRendererEvent, ...args: any[]) => void
): void => {
	ipcRendererListener(eventName, callback);
};

export const ipcWindowsMainHandle = <T>(
	eventName: IPCWindowsHeaderMenusEventName,
	listener: (event: IpcMainInvokeEvent, ...args: any[]) => Promise<T> | void | T
): void => {
	ipcMainHandle(eventName, listener);
};

export const ipcWindowsMainSend = (
	window: BrowserWindow,
	eventName: IPCWindowsHeaderMenusEventName,
	...args: any[]
) => {
	ipcMainSend(window, eventName, ...args);
};
