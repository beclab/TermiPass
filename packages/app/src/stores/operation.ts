import { defineStore } from 'pinia';
import { Platform } from 'quasar';
import { OPERATE_ACTION } from './../utils/contact';
import { RouteLocationNormalizedLoaded } from 'vue-router';

import { downloadFile, downloadElectron } from '../api/common/downloadFormat';

import { useDataStore } from './data';

// import { operationAPI } from './../api';

import { dataAPIsa } from './../api';

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
					this.download(route.path);
					break;

				case OPERATE_ACTION.UPLOAD_FILES:
					this.uploadFiles();
					break;

				case OPERATE_ACTION.UPLOAD_FOLDER:
					this.uploadFolder();
					break;

				case OPERATE_ACTION.ATTRIBUTES:
					dataStore.showHover('info');
					break;

				case OPERATE_ACTION.COPY:
					this.copyCatalogue();
					callback(OPERATE_ACTION.COPY, null);
					break;

				case OPERATE_ACTION.CUT:
					this.cutCatalogue();
					callback(OPERATE_ACTION.CUT, null);
					break;

				case OPERATE_ACTION.PASTE:
					this.pasteCatalogue(route, callback);
					break;

				case OPERATE_ACTION.MOVE:
					this.moveCatalogue(route.path, callback);
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
					callback(
						OPERATE_ACTION.OPEN_LOCAL_SYNC_FOLDER,
						this.openLocalFolder()
					);

					break;

				default:
					break;
			}
		},

		async download(path: string) {
			const dataAPI = dataAPIsa();
			const { url, headers } = await dataAPI.dowload(path);

			alert(url);
			const isElectron = Platform.is.electron;

			if (!isElectron && url) {
				downloadFile({ url, headers });
			}

			if (isElectron && url && url.length > 0) {
				downloadElectron({ url });
			}
		},

		async copyCatalogue() {
			console.log('into copyCatalogue');
			const dataStore = useDataStore();
			const dataAPI = dataAPIsa();
			const copyStorages = await dataAPI.copy();
			console.log('copyCatalogue', copyStorages);

			dataStore.updateCopyFiles(copyStorages);
		},

		async pasteCatalogue(
			route: RouteLocationNormalizedLoaded,
			callback: (action: OPERATE_ACTION, data: any) => Promise<void>
		) {
			console.log(route);
			console.log(callback);
			const dataAPI = dataAPIsa();
			await dataAPI.paste(route, callback);
		},

		async cutCatalogue() {
			const dataStore = useDataStore();
			const dataAPI = dataAPIsa();
			const copyStorages = await dataAPI.cut();

			console.log('copyStoragescopyStorages', copyStorages);
			dataStore.updateCopyFiles(copyStorages);
		},

		async moveCatalogue(
			path: string,
			callback: (action: OPERATE_ACTION, data: any) => Promise<void>
		) {
			const dataAPI = dataAPIsa();
			await dataAPI.move(path, callback);
		},

		uploadFiles() {
			const dataAPI = dataAPIsa();
			dataAPI.uploadFiles();
		},

		uploadFolder() {
			const dataAPI = dataAPIsa();
			dataAPI.uploadFolder();
		},

		openLocalFolder() {
			const dataAPI = dataAPIsa();
			dataAPI.openLocalFolder();
		}
	}
});
