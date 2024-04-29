import { ipcWindowsRendererInvoke } from './interface';

const close = async (): Promise<void> => {
	await ipcWindowsRendererInvoke<void>('close');
};

const maximize = async (): Promise<void> => {
	await ipcWindowsRendererInvoke<void>('maximize');
};

const minimize = async (): Promise<void> => {
	await ipcWindowsRendererInvoke<void>('minimize');
};

const isMaximized = async (): Promise<boolean> => {
	return await ipcWindowsRendererInvoke('isMaximized');
};

const winMove = async (isMove: boolean): Promise<void> => {
	return await ipcWindowsRendererInvoke('winMove', isMove);
};

export const registerWindowsMethods = {
	close,
	maximize,
	minimize,
	isMaximized,
	winMove
};
