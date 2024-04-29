import {
	ipcFilesRendererInvoke,
	IFilesLoginAccountInterface,
	IFilesRepoAddSyncInterface
} from './interface';

/* seafile */
const loginAccount = async (
	data: IFilesLoginAccountInterface
): Promise<boolean> => {
	return await ipcFilesRendererInvoke<boolean>('loginAccount', data);
};

const setAutoSyncEnable = async (authSync: boolean): Promise<boolean> => {
	return await ipcFilesRendererInvoke('setAutoSyncEnable', authSync);
};

const isAutoSyncEnable = async (): Promise<boolean> => {
	return ipcFilesRendererInvoke('isAutoSyncEnable');
};

const hasLocalRepo = async (repo_id: string): Promise<boolean> => {
	return await ipcFilesRendererInvoke('hasLocalRepo', repo_id);
};

const openLocalRepo = async (
	repo_id: string,
	subPath?: string
): Promise<void> => {
	await ipcFilesRendererInvoke<void>('openLocalRepo', repo_id, subPath);
};

const repoAddSync = async (
	data: IFilesRepoAddSyncInterface
): Promise<boolean> => {
	return await ipcFilesRendererInvoke<boolean>('repoAddSync', data);
};

const repoRemoveSync = async (repo_id: string): Promise<boolean> => {
	return await ipcFilesRendererInvoke('repoRemoveSync', repo_id);
};

const syncRepoImmediately = async (repo_id: string): Promise<boolean> => {
	return await ipcFilesRendererInvoke('syncRepoImmediately', repo_id);
};

const repoSyncInfo = async (repo_id: string): Promise<string> => {
	return await ipcFilesRendererInvoke('repoSyncInfo', repo_id);
};

const defaultSyncSavePath = async (): Promise<string> => {
	return await ipcFilesRendererInvoke('defaultSyncSavePath');
};

const selectSyncSavePath = async (): Promise<string> => {
	return await ipcFilesRendererInvoke('selectSyncSavePath');
};

const removeCurrentAccount = async (
	data: IFilesLoginAccountInterface
): Promise<boolean> => {
	return await ipcFilesRendererInvoke('removeCurrentAccount', data);
};

export const registerFilesMethods = {
	loginAccount,
	setAutoSyncEnable,
	isAutoSyncEnable,
	hasLocalRepo,
	openLocalRepo,
	repoAddSync,
	repoRemoveSync,
	syncRepoImmediately,
	repoSyncInfo,
	defaultSyncSavePath,
	selectSyncSavePath,
	removeCurrentAccount
};
