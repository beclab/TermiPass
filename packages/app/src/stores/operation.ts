import { defineStore } from 'pinia';
import { Platform } from 'quasar';
import { OPERATE_ACTION } from './../utils/contact';
import { RouteLocationNormalizedLoaded } from 'vue-router';

import { downloadFile, downloadElectron } from '../api/common/downloadFormat';

import { useDataStore } from './data';
// import { useSeahubStore } from './seahub';

import { operationAPI } from './../api';

// export type DataState = {};

export const useOperateinStore = defineStore('operation', {
	// state: () => {
	// 	return {} as DataState;
	// },

	getters: {},

	actions: {
		handleFileOperate(
			e: any,
			route: RouteLocationNormalizedLoaded,
			action: OPERATE_ACTION,
			callback: (action: OPERATE_ACTION, data: any) => Promise<void>
		) {
			e.preventDefault();
			e.stopPropagation();

			console.log('route', route);

			const dataStore = useDataStore();

			switch (action) {
				case OPERATE_ACTION.CREATE_FOLDER:
					dataStore.showHover('newDir');
					break;

				case OPERATE_ACTION.CREATE_REPO:
					dataStore.showHover('NewLib');
					break;

				case OPERATE_ACTION.DOWNLOAD:
					this._download(route.path);
					break;

				case OPERATE_ACTION.UPLOAD_FILES:
					// _uploadFiles();
					break;

				case OPERATE_ACTION.UPLOAD_FOLDER:
					// _uploadFolder();
					break;

				case OPERATE_ACTION.ATTRIBUTES:
					dataStore.showHover('info');
					break;

				case OPERATE_ACTION.COPY:
					this._copyCatalogue();
					callback(OPERATE_ACTION.COPY, null);
					break;

				case OPERATE_ACTION.CUT:
					// _cutCatalogue();
					callback(OPERATE_ACTION.CUT, null);
					break;

				case OPERATE_ACTION.PASTE:
					// _pasteCatalogue(route, callback);
					break;

				case OPERATE_ACTION.MOVE:
					// _moveCatalogue(route.path, callback);
					break;

				case OPERATE_ACTION.RENAME:
					dataStore.showHover('rename');
					break;

				case OPERATE_ACTION.DELETE:
					dataStore.showHover('delete');
					break;

				case OPERATE_ACTION.REFRESH:
					dataStore.setReload(true);
					break;

				case OPERATE_ACTION.SHARE:
					dataStore.showHover('share-dialog');
					break;

				case OPERATE_ACTION.SYNCHRONIZE_TO_LOCAL:
					break;

				case OPERATE_ACTION.OPEN_LOCAL_SYNC_FOLDER:
					// callback(OPERATE_ACTION.OPEN_LOCAL_SYNC_FOLDER, openLocalFolder());

					break;

				default:
					break;
			}
		},

		async _download(path: string) {
			const { url, headers } = await operationAPI.dowload(path);

			const isElectron = Platform.is.electron;

			if (!isElectron && url) {
				downloadFile({ url, headers });
			}

			if (isElectron && url && url.length > 0) {
				downloadElectron({ url });
			}
		},

		async _copyCatalogue() {
			console.log('into _copyCatalogue');
			const dataStore = useDataStore();

			const copyStorages = await operationAPI.copy();
			console.log('_copyCatalogue', copyStorages);

			dataStore.updateCopyFiles(copyStorages);
		}
	}
});
