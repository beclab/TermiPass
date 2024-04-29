import store from './electron-store';
import { ipcStoreMainHandle } from './interface';

export const registerStoreService = () => {
	listenerEvent();
};

const listenerEvent = () => {
	ipcStoreMainHandle('electronStoreGet', (_event, key: string) => {
		return store.store.get(key);
	});

	ipcStoreMainHandle('electronStoreSet', (_event, key: string, value: any) => {
		store.store.set(key, value);
	});

	ipcStoreMainHandle('electronStoreRemove', (_event, key: string) => {
		store.store.delete(key);
	});

	ipcStoreMainHandle('electronStoreClear', () => {
		store.store.clear();
	});
};
