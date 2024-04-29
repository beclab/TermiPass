import { IpcMainInvokeEvent, IpcRendererEvent, BrowserWindow } from 'electron';
import { ipcRendererInvoke, ipcRendererListener } from '../utils/preload';
import { ipcMainHandle, ipcMainSend } from '../utils/main';
import {
	IPCVpnEventName,
	IOpenVpnInterface as OpenVpnInterface
} from '../../src/platform/electron/interface';

export const ipcVpnRendererInvoke = <T>(
	eventName: IPCVpnEventName,
	...args: any[]
): Promise<T> => {
	return ipcRendererInvoke(eventName, ...args);
};

export const ipcVpnRendererListener = (
	eventName: IPCVpnEventName,
	callback: (event: IpcRendererEvent, ...args: any[]) => void
): void => {
	ipcRendererListener(eventName, callback);
};

export const ipcVpnMainHandle = <T>(
	eventName: IPCVpnEventName,
	listener: (event: IpcMainInvokeEvent, ...args: any[]) => Promise<T> | void | T
): void => {
	ipcMainHandle(eventName, listener);
};

export const ipcVpnMainSend = (
	window: BrowserWindow,
	eventName: IPCVpnEventName,
	...args: any[]
) => {
	ipcMainSend(window, eventName, ...args);
};

export type IOpenVpnInterface = OpenVpnInterface;
