import { BrowserWindow, IpcMainInvokeEvent, IpcRendererEvent } from 'electron';
import { ipcMainHandle, ipcMainSend } from '../utils/main';
import { ipcRendererInvoke, ipcRendererListener } from '../utils/preload';
import { IPCSettingsEventName } from '../../src/platform/electron/interface';
import { IAppInfo as AppInfo } from '../../src/platform/electron/interface';

export const ipcSettingsRendererInvoke = <T>(
	eventName: IPCSettingsEventName,
	...args: any[]
): Promise<T> => {
	return ipcRendererInvoke(eventName, ...args);
};

export const ipcSettingsRendererListener = (
	eventName: IPCSettingsEventName,
	callback: (event: IpcRendererEvent, ...args: any[]) => void
): void => {
	ipcRendererListener(eventName, callback);
};

/**
 * 添加 ipc 调用的处理事件
 * @param eventName - ipc 事件名
 * @param listener - 回调事件
 */
export const ipcSettingsMainHandle = <T>(
	eventName: IPCSettingsEventName,
	listener: (event: IpcMainInvokeEvent, ...args: any[]) => Promise<T> | void | T
): void => {
	ipcMainHandle(eventName, listener);
};

export const ipcSettingsMainSend = (
	window: BrowserWindow,
	eventName: IPCSettingsEventName,
	...args: any[]
) => {
	ipcMainSend(window, eventName, ...args);
};

export type IAppInfo = AppInfo;

export type PreventSleepTaskName = 'download';
