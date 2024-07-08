import { defineStore } from 'pinia';
import { Platform } from 'quasar';
import { OPERATE_ACTION } from './../utils/contact';
import { EventType, ContextType } from './../api/common/encoding';
import { RouteLocationNormalizedLoaded } from 'vue-router';

import { downloadFile, downloadElectron } from '../api/common/downloadFormat';

import { useDataStore } from './data';
import { MenuItem } from '../utils/contact';

import { dataAPIs } from './../api';

import { i18n } from 'src/boot/i18n';

export type DataState = {
	contextmenu: ContextType[];
	disableMenuItem: string[];
};

export const useOperateinStore = defineStore('operation', {
	state: () => {
		return {
			contextmenu: [
				{
					name: i18n.global.t('files_popup_menu.open_local_sync_folder'),
					icon: 'sym_r_folder_open',
					type: 'seahub',
					action: OPERATE_ACTION.OPEN_LOCAL_SYNC_FOLDER,
					condition: (event: EventType) => event.type === 'sync'
				},
				{
					name: i18n.global.t('buttons.download'),
					icon: 'sym_r_browser_updated',
					action: OPERATE_ACTION.DOWNLOAD,
					condition: (event: EventType) => event.isSelected
				},
				{
					name: i18n.global.t('copy'),
					icon: 'sym_r_content_copy',
					action: OPERATE_ACTION.COPY,
					condition: (event: EventType) => event.isSelected
				},
				{
					name: i18n.global.t('files.cut'),
					icon: 'sym_r_move_up',
					action: OPERATE_ACTION.CUT,
					condition: (event: EventType) => event.isSelected
				},
				{
					name: i18n.global.t('files_popup_menu.rename'),
					icon: 'sym_r_edit_square',
					action: OPERATE_ACTION.RENAME,
					condition: (event: EventType) =>
						event.isSelected && event.showRename && !event.isHomePage
				},
				{
					name: i18n.global.t('files_popup_menu.delete'),
					icon: 'sym_r_edit_square',
					action: OPERATE_ACTION.DELETE,
					condition: (event: EventType) => event.isSelected && !event.isHomePage
				},
				{
					name: i18n.global.t('files_popup_menu.attributes'),
					icon: 'sym_r_ballot',
					action: OPERATE_ACTION.ATTRIBUTES,
					condition: (event: EventType) => event.isSelected
				},
				{
					name: i18n.global.t('files_popup_menu.new_folder'),
					icon: 'sym_r_create_new_folder',
					action: OPERATE_ACTION.CREATE_FOLDER,
					condition: (event: EventType) => !event.isSelected
				},
				{
					name: i18n.global.t('files_popup_menu.upload_file'),
					icon: 'sym_r_upload_file',
					action: OPERATE_ACTION.UPLOAD_FILES,
					condition: (event: EventType) => !event.isSelected
				},
				{
					name: i18n.global.t('files_popup_menu.upload_folder'),
					icon: 'sym_r_drive_folder_upload',
					action: OPERATE_ACTION.UPLOAD_FOLDER,
					condition: (event: EventType) => !event.isSelected
				},
				{
					name: i18n.global.t('paste'),
					icon: 'sym_r_content_paste',
					action: OPERATE_ACTION.PASTE,
					condition: (event: EventType) => !event.isSelected && event.hasCopied
				},
				{
					name: i18n.global.t('files.refresh'),
					icon: 'sym_r_replay',
					action: OPERATE_ACTION.REFRESH,
					condition: (event: EventType) => !event.isSelected
				}
			],
			disableMenuItem: [
				MenuItem.HOME,
				MenuItem.DOCUMENTS,
				MenuItem.PICTURES,
				MenuItem.MOVIES,
				MenuItem.DOWNLOADS,
				MenuItem.DATA,
				MenuItem.CACHE,
				MenuItem.CODE,
				MenuItem.MUSIC
			]
		} as DataState;
	},

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

			const dataStore = useDataStore();

			console.log('handleFileOperate ===>');
			console.log('CREATE_FOLDER', OPERATE_ACTION.CREATE_FOLDER);
			console.log('CREATE_FOLDER => action', action);

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
					this.pasteCatalogue(route.path, callback);
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
			const dataAPI = dataAPIs();
			const { url, headers } = await dataAPI.download(path);

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
			const dataStore = useDataStore();
			const dataAPI = dataAPIs();
			const copyStorages = await dataAPI.copy();

			dataStore.updateCopyFiles(copyStorages);
		},

		async pasteCatalogue(
			path: string,
			callback: (action: OPERATE_ACTION, data: any) => Promise<void>
		) {
			const dataAPI = dataAPIs();
			await dataAPI.paste(path, callback);
		},

		async cutCatalogue() {
			const dataStore = useDataStore();
			const dataAPI = dataAPIs();
			const copyStorages = await dataAPI.cut();

			dataStore.updateCopyFiles(copyStorages);
		},

		async moveCatalogue(
			path: string,
			callback: (action: OPERATE_ACTION, data: any) => Promise<void>
		) {
			const dataAPI = dataAPIs();
			await dataAPI.move(path, callback);
		},

		uploadFiles() {
			const dataAPI = dataAPIs();
			dataAPI.uploadFiles();
		},

		uploadFolder() {
			const dataAPI = dataAPIs();
			dataAPI.uploadFolder();
		},

		openLocalFolder() {
			const dataAPI = dataAPIs();
			dataAPI.openLocalFolder();
		}
	}
});
