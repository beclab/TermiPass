import { IpcRendererEvent } from 'electron';
import {
	ipcSettingsRendererInvoke,
	ipcSettingsRendererListener,
	IAppInfo
} from './interface';

const getAutomaticallyStartBoot = (): Promise<boolean> =>
	ipcSettingsRendererInvoke('getAutomaticallyStartBoot');

const setAutomaticallyStartBoot = (enable: boolean): Promise<void> =>
	ipcSettingsRendererInvoke('setAutomaticallyStartBoot', enable);

const getAppInfo = (): Promise<IAppInfo> =>
	ipcSettingsRendererInvoke('getAppInfo');

const listenerNetworkUpdate = (
	callback: (event: IpcRendererEvent, ...args: any[]) => void
): void => ipcSettingsRendererListener('listenerNetworkUpdate', callback);

const getTaskPreventSleepBoot = (): Promise<boolean> =>
	ipcSettingsRendererInvoke('getTaskPreventSleepBoot');

const setTaskPreventSleepBoot = (status: boolean): Promise<void> =>
	ipcSettingsRendererInvoke('setTaskPreventSleepBoot', status);

export const registerSettingsMethods = {
	getAutomaticallyStartBoot,
	setAutomaticallyStartBoot,
	getAppInfo,
	listenerNetworkUpdate,
	getTaskPreventSleepBoot,
	setTaskPreventSleepBoot
};
