import { IpcRendererEvent } from 'electron';
import {
	ipcWinVPNRendererInvoke,
	ipcWinVPNRendererListener
} from './interface';

const getCookie = async (): Promise<void> => {
	await ipcWinVPNRendererInvoke<void>('getCookie');
};

const winHadLoad = async (): Promise<void> => {
	await ipcWinVPNRendererInvoke<void>('winHadLoad');
};

const listenerNetworkUpdate = (
	callback: (event: IpcRendererEvent, ...args: any[]) => void
): void => ipcWinVPNRendererListener('registerPort', callback);

export const registerWinVPNMethods = {
	getCookie,
	listenerNetworkUpdate,
	winHadLoad
};
