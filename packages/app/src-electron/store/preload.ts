import { ipcStoreRendererInvoke } from './interface';

const get = async (key: string): Promise<any> => {
	return await ipcStoreRendererInvoke<any>('electronStoreGet', key);
};

const set = async (key: string, value: string): Promise<void> => {
	await ipcStoreRendererInvoke<void>('electronStoreSet', key, value);
};

const remove = async (key: string): Promise<void> => {
	ipcStoreRendererInvoke<void>('electronStoreRemove', key);
};

const clear = async (): Promise<void> => {
	ipcStoreRendererInvoke<void>('electronStoreClear');
};

export const registerStoreMethods = {
	get,
	set,
	remove,
	clear
};
