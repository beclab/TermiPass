import { ITransferFile, ipcTransferMainHandle } from './interface';
import stores from '../store/electron-store';
import { openFile, openFileInFolder } from '../utils';
export const registerTransferService = () => {
	listenerEvent();
};

// 添加主进程 ipc 调用事件
const listenerEvent = () => {
	ipcTransferMainHandle('getDownloadData', () => {
		return stores.store.get(
			stores.createKeyWithUser(stores.DOWNLOAD_HISTORY),
			[]
		);
	});

	ipcTransferMainHandle('getUploadData', () => {
		return [];
	});

	ipcTransferMainHandle('getCompleteData', () => {
		return stores.store.get(
			stores.createKeyWithUser(stores.TRANSFER_HISTORY),
			[]
		);
	});

	ipcTransferMainHandle('clearCompleteData', (_event, list: string[]) => {
		if (list.length > 0) {
			let storeList: ITransferFile[] = stores.store.get(
				stores.createKeyWithUser(stores.TRANSFER_HISTORY),
				[]
			) as ITransferFile[];
			storeList = storeList.filter((e) => list.findIndex((i) => i == e.id) < 0);
			stores.store.set(
				stores.createKeyWithUser(stores.TRANSFER_HISTORY),
				storeList
			);
		} else {
			stores.store.delete(stores.createKeyWithUser(stores.TRANSFER_HISTORY));
		}
		return true;
	});

	// 打开文件
	ipcTransferMainHandle('openFile', (_event, path: string) => openFile(path));

	// 打开文件所在路径
	ipcTransferMainHandle('openFileInFolder', (_event, path: string) =>
		openFileInFolder(path)
	);
};

export const addTransferHistory = (history: ITransferFile) => {
	let result = stores.store.get(
		stores.createKeyWithUser(stores.TRANSFER_HISTORY),
		[]
	) as ITransferFile[];
	result = [history].concat(result);
	stores.store.set(stores.createKeyWithUser(stores.TRANSFER_HISTORY), result);
};
