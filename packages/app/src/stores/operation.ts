import { defineStore } from 'pinia';
import { Platform } from 'quasar';
import { OPERATE_ACTION } from './../utils/contact';
// import { EventType, ContextType } from './../api/common/encoding';
import { RouteLocationNormalizedLoaded } from 'vue-router';

import { downloadFile, downloadElectron } from '../api/common/downloadFormat';
// import { useFilesStore } from './../stores/files';
// import { useMenuStore } from './../stores/files-menu';

import { useDataStore } from './data';
import { MenuItem } from '../utils/contact';

// import { operationAPI } from './../api';

import { dataAPIs } from './../api';
import { DriveType } from './files';

export interface EventType {
	type?: DriveType;
	isSelected: boolean; //	true: Right click on a certain item; false: Right click on a blank area on the files
	hasCopied: boolean;
	showRename: boolean;
	isHomePage: boolean;
}
export interface ContextType {
	name: string;
	icon: string;
	type?: string;
	action: OPERATE_ACTION.OPEN_LOCAL_SYNC_FOLDER;
	condition: (event: EventType) => boolean;
}

export interface CopyStoragesType {
	from: string;
	to: string;
	name: string;
	src_drive_type?: DriveType;
	dst_drive_type?: DriveType;
	key?: string;
}

export type DataState = {
	contextmenu: ContextType[];
	disableMenuItem: string[];
	copyFiles: CopyStoragesType[];
};

export const useOperateinStore = defineStore('operation', {
	state: () => {
		return {
			contextmenu: [
				{
					name: 'Open Local Sync Folder',
					icon: 'sym_r_folder_open',
					type: 'seahub',
					action: OPERATE_ACTION.OPEN_LOCAL_SYNC_FOLDER,
					condition: (event: EventType) => event.type === DriveType.Sync
				},
				{
					name: 'Download',
					icon: 'sym_r_browser_updated',
					action: OPERATE_ACTION.DOWNLOAD,
					condition: (event: EventType) => event.isSelected
				},
				{
					name: 'Copy',
					icon: 'sym_r_content_copy',
					action: OPERATE_ACTION.COPY,
					condition: (event: EventType) => event.isSelected
				},
				{
					name: 'Cut',
					icon: 'sym_r_move_up',
					action: OPERATE_ACTION.CUT,
					condition: (event: EventType) => event.isSelected
				},
				{
					name: 'Rename',
					icon: 'sym_r_edit_square',
					action: OPERATE_ACTION.RENAME,
					condition: (event: EventType) =>
						event.isSelected && event.showRename && !event.isHomePage
				},
				{
					name: 'Delete',
					icon: 'sym_r_edit_square',
					action: OPERATE_ACTION.DELETE,
					condition: (event: EventType) => event.isSelected && !event.isHomePage
				},
				{
					name: 'Attributes',
					icon: 'sym_r_ballot',
					action: OPERATE_ACTION.ATTRIBUTES,
					condition: (event: EventType) => event.isSelected
				},
				{
					name: 'New Folder',
					icon: 'sym_r_create_new_folder',
					action: OPERATE_ACTION.CREATE_FOLDER,
					condition: (event: EventType) => !event.isSelected
				},
				{
					name: 'Upload Files',
					icon: 'sym_r_upload_file',
					action: OPERATE_ACTION.UPLOAD_FILES,
					condition: (event: EventType) => !event.isSelected
				},
				{
					name: 'Upload Folder',
					icon: 'sym_r_drive_folder_upload',
					action: OPERATE_ACTION.UPLOAD_FOLDER,
					condition: (event: EventType) => !event.isSelected
				},
				{
					name: 'Paste',
					icon: 'sym_r_content_paste',
					action: OPERATE_ACTION.PASTE,
					condition: (event: EventType) => !event.isSelected && event.hasCopied
				},
				{
					name: 'Refresh',
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
			],
			copyFiles: []
		} as DataState;
	},

	getters: {},

	actions: {
		async handleFileOperate(
			e: any,
			route: RouteLocationNormalizedLoaded,
			action: OPERATE_ACTION,
			driveType: DriveType,
			callback: (action: OPERATE_ACTION, data: any) => Promise<void>
		): Promise<void> {
			e.preventDefault();
			e.stopPropagation();

			const dataStore = useDataStore();

			console.log('handleFileOperate ===>');
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
					this.copyCatalogue(driveType);
					// callback(OPERATE_ACTION.COPY, null);
					break;

				case OPERATE_ACTION.CUT:
					this.cutCatalogue(driveType);
					// callback(OPERATE_ACTION.CUT, null);
					break;

				case OPERATE_ACTION.PASTE:
					this.pasteCatalogue(route.fullPath, driveType, callback);
					break;

				case OPERATE_ACTION.MOVE:
					this.moveCatalogue(route, driveType, callback);
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
			console.log('downloaddownload', path);
			const { url, headers } = await dataAPI.download(path);

			const isElectron = Platform.is.electron;

			if (!isElectron && url) {
				downloadFile({ url, headers });
			}

			if (isElectron && url && url.length > 0) {
				downloadElectron({ url });
			}
		},

		async copyCatalogue(driveType: DriveType) {
			const operateinStore = useOperateinStore();
			const dataAPI = dataAPIs(driveType);
			const copyStorages = await dataAPI.copy();

			operateinStore.updateCopyFiles(copyStorages);
		},

		async pasteCatalogue(
			path: string,
			driveType: DriveType,
			callback: (action: OPERATE_ACTION, data: any) => Promise<void>
		) {
			const dataAPI = dataAPIs(driveType);
			dataAPI.paste(path, callback);
		},

		async cutCatalogue(driveType: DriveType) {
			const operateinStore = useOperateinStore();
			const dataAPI = dataAPIs(driveType);
			const copyStorages = await dataAPI.cut();

			operateinStore.updateCopyFiles(copyStorages);
		},

		async moveCatalogue(
			route: RouteLocationNormalizedLoaded,
			driveType: DriveType,
			callback: (action: OPERATE_ACTION, data: any) => Promise<void>
		) {
			console.log('moveCataloguemoveCatalogue', route.path);
			const dataAPI = dataAPIs(driveType);
			await dataAPI.move(route.path, callback);
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
		},

		updateCopyFiles(copyStorages: CopyStoragesType[]) {
			this.copyFiles = copyStorages;
		},

		resetCopyFiles() {
			this.copyFiles = [];
		}
	}
});
