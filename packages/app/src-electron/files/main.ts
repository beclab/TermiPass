import { shell, dialog } from 'electron'; // dialog
import {
	ipcFilesMainHandle,
	IFilesLoginAccountInterface,
	filesMainHandleCallBack,
	filesWorkerInit,
	IFilesRepoAddSyncInterface,
	IFilesSyncStatus
} from './interface';

import { UpdateTrayImg } from '../utils';

export const registerFilesService = (updateTray: UpdateTrayImg) => {
	listenerEvent(updateTray);
};

const listenerEvent = async (updateTray: UpdateTrayImg) => {
	filesWorkerInit();

	ipcFilesMainHandle(
		'loginAccount',
		(_event, data: IFilesLoginAccountInterface) =>
			filesMainHandleCallBack('loginAccount', {
				url: data.url,
				username: data.username,
				authToken: data.authToken
			})
	);

	ipcFilesMainHandle('setAutoSyncEnable', (_event, authSync: boolean) =>
		filesMainHandleCallBack('setAutoSyncEnable', {
			authSync
		})
	);

	ipcFilesMainHandle('isAutoSyncEnable', () =>
		filesMainHandleCallBack('isAutoSyncEnable', {})
	);

	ipcFilesMainHandle('hasLocalRepo', (_event, repo_id: string) =>
		filesMainHandleCallBack('hasLocalRepo', { repo_id }, repo_id)
	);

	ipcFilesMainHandle(
		'openLocalRepo',
		(_event, repo_id: string, subPath?: string) =>
			filesMainHandleCallBack(
				'openLocalRepo',
				{ repo_id },
				repo_id,
				true,
				(result: string) => {
					if (result && result.length) {
						const path = `${result}${subPath ? subPath : ''}`;
						shell.openPath(path);
					}
				}
			)
	);

	ipcFilesMainHandle(
		'repoAddSync',
		(_event, data: IFilesRepoAddSyncInterface) =>
			filesMainHandleCallBack('repoAddSync', data, data.repo_id)
	);

	ipcFilesMainHandle('repoRemoveSync', (_event, repo_id: string) =>
		filesMainHandleCallBack(
			'repoRemoveSync',
			{
				repo_id
			},
			repo_id
		)
	);

	ipcFilesMainHandle('syncRepoImmediately', (_event, repo_id: string) =>
		filesMainHandleCallBack(
			'syncRepoImmediately',
			{
				repo_id
			},
			repo_id
		)
	);

	ipcFilesMainHandle('repoSyncInfo', (_event, repo_id: string) =>
		filesMainHandleCallBack(
			'repoSyncInfo',
			{
				repo_id
			},
			repo_id
		)
	);

	ipcFilesMainHandle('defaultSyncSavePath', () =>
		filesMainHandleCallBack('defaultSyncSavePath', {})
	);

	ipcFilesMainHandle('selectSyncSavePath', async () => {
		const defaultPath = await filesMainHandleCallBack(
			'defaultSyncSavePath',
			{},
			undefined,
			false
		);
		const result = await dialog.showOpenDialog({
			properties: ['openDirectory'],
			title: 'Please select the save directory',
			buttonLabel: 'Select',
			defaultPath: defaultPath
		});

		return result && result.filePaths && result.filePaths.length > 0
			? result.filePaths[0]
			: defaultPath;
	});

	ipcFilesMainHandle(
		'removeCurrentAccount',
		async (_event, data: IFilesLoginAccountInterface) =>
			filesMainHandleCallBack('removeCurrentAccount', data, data.username)
	);

	ipcFilesMainHandle('updateSyncStatus', (_, status: IFilesSyncStatus) => {
		let imageName = '';
		if (status.pause) {
			imageName = 'Pause';
		} else if (status.syncing) {
			imageName = 'Syncing';
		} else if (status.done) {
			imageName = 'Done';
		}
		updateTray('tray' + imageName + 'Template');
	});
};
