import {
	IpcMainInvokeEvent,
	IpcRendererEvent,
	BrowserWindow,
	MessagePortMain
} from 'electron';
import { ipcRendererInvoke, ipcRendererListener } from '../utils/preload';
import { ipcMainHandle, ipcMainSend, ipcMainPostMessage } from '../utils/main';
import { IPCWinVPNEventName } from '../../src/platform/electron/interface';

export const ipcWinVPNRendererInvoke = <T>(
	eventName: IPCWinVPNEventName,
	...args: any[]
): Promise<T> => {
	return ipcRendererInvoke(eventName, ...args);
};

export const ipcWinVPNRendererListener = (
	eventName: IPCWinVPNEventName,
	callback: (event: IpcRendererEvent, ...args: any[]) => void
): void => {
	ipcRendererListener(eventName, callback);
};

export const ipcWinVPNMainHandle = <T>(
	eventName: IPCWinVPNEventName,
	listener: (event: IpcMainInvokeEvent, ...args: any[]) => Promise<T> | void | T
): void => {
	ipcMainHandle(eventName, listener);
};

export const ipcWinVPNMainSend = (
	window: BrowserWindow,
	eventName: IPCWinVPNEventName,
	...args: any[]
) => {
	ipcMainSend(window, eventName, ...args);
};

export const ipcVPNMainPostMessage = (
	window: BrowserWindow,
	eventName: IPCWinVPNEventName,
	transfer?: MessagePortMain[]
) => {
	ipcMainPostMessage(window, eventName, transfer);
};
