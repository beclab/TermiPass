import { defineStore } from 'pinia';
import { Router } from 'vue-router';
import { Origin } from '../api/origin';
import { Data as DriveData } from '../api/drive/data';
import { Data as SyncData } from '../api/sync/data';
import { getParams } from './../utils/utils';

export enum DriveType {
	Drive,
	Sync,
	Data,
	Cache,
	GoogleDrive,
	Dropbox
}

export interface DriveSortingType {
	asc: boolean;
	by: string;
}

export class FilePath {
	isDir: boolean;
	path: string;
	driveType: DriveType;
	param: string;

	constructor(props?: Partial<FilePath>) {
		props && Object.assign(this, props);
	}
}

export class FileResType {
	extension: string;
	fileSize?: number;
	isDir: boolean;
	isSymlink: boolean;
	mode: number;
	modified: string;
	name: string;
	numDirs: number;
	numFiles: number;
	numTotalFiles?: number;
	path: string;
	size: number;
	type?: string;
	items: FileItem[];
	sorting: DriveSortingType;
	url?: string;
	driveType: DriveType;

	constructor(props?: Partial<FileResType>) {
		props && Object.assign(this, props);
	}
}

export class FileItem {
	extension: string;
	isDir: boolean;
	isSymlink: boolean;
	mode: number;
	modified: string;
	name: string;
	path: string;
	size: number;
	type: string;
	parentPath?: string;
	sorting?: DriveSortingType;
	numDirs?: number;
	numFiles?: number;
	numTotalFiles?: number;
	encoded_thumbnail_src?: string;
	index: number;
	url: string;
	content?: string;

	driveType: DriveType;
	param: string;

	constructor(props?: Partial<FileItem>) {
		props && Object.assign(this, props);
	}
}

export type FileState = {
	isInPreview: boolean;
	sort: DriveSortingType;
	currentPath: FilePath;
	backStack: FilePath[];
	previousStack: FilePath[];
	currentFileList: FileItem[];
	cached: Record<string, FileItem[]>;
	selected: number[];
	previewItem: any;
};

const driveData = new DriveData();
const syncData = new SyncData();

function getAPI(driveType: DriveType): Origin {
	if (driveType == DriveType.Drive) {
		return driveData;
	} else {
		return syncData;
	}
}

export const useFilesStore = defineStore('files', {
	state: () => {
		return {
			sort: {
				by: '',
				asc: false
			},
			isInPreview: false,
			currentPath: {
				isDir: true,
				path: '/',
				driveType: DriveType.Drive,
				param: ''
			},
			backStack: [],
			previousStack: [],
			currentFileList: [],
			cached: {},
			selected: [],
			previewItem: {}
		} as FileState;
	},
	getters: {
		currentFileItems(): FileItem[] {
			return this.currentFileList.filter((item) => !item.isDir);
		},

		currentDirItems(): FileItem[] {
			return this.currentFileList.filter((item) => item.isDir);
		},

		selectedCount: (state) => state.selected.length
	},
	actions: {
		async setFilePath(path: FilePath, isBack = false, router?: Router) {
			console.log('setFilePath', path);
			if (!path.isDir) {
				// We need to invoke the preview dialog here, rather than modifying the route.

				this.isInPreview = true;
				this.openPreviewDialog(path);
				return;
			}

			// const router = await useRouter();
			let key = path.path + '=' + path.driveType;
			if (path.param) {
				key = key + '=' + path.param;
			}

			if (key in this.cached) {
				this.currentFileList = this.cached[key];
			} else {
				this.currentFileList = [];
			}

			this.isInPreview = false;
			this.currentPath = path;

			if (!isBack) {
				this.backStack.push(path);
				this.previousStack = [];
			}

			console.log('pathpathpathpathpathpath', path.path);

			router &&
				router.push({
					path: path.path,
					query: {
						id: getParams(path.param, 'id'),
						type: getParams(path.param, 'type'),
						p: getParams(path.param, 'p')
					}
				});

			const requestUrl = await this.formatPathtoUrl(path);

			console.log('driveType', path.driveType);

			getAPI(path.driveType)
				.fetch(requestUrl)
				.then((res: FileResType) => {
					console.log('getAPIgetAPI', res);
					const fileList = res.items;
					if (
						path.driveType == this.currentPath.driveType &&
						path.path == this.currentPath.path &&
						path.param == this.currentPath.param
					) {
						this.currentFileList = fileList;
					}
					this.cached[key] = fileList;
				})
				.catch((error) => {
					console.error('Error fetching items', error);
				});
		},

		setBrowserUrl(
			url: string,
			driveType: DriveType = DriveType.Drive,
			router: Router
		) {
			console.log('setBrowserUrlsetBrowserUrl', url);
			const splitUrl = url.split('?');
			console.log('splitUrl', splitUrl);
			// console.log('setBrowserUrlendsWith', url.endsWith(''));

			// if (url.endsWith('')) {
			// 	//
			// } else {
			const path = new FilePath({
				path: splitUrl[0],
				param: splitUrl[1] ? `?${splitUrl[1]}` : '',
				isDir: true,
				driveType: driveType
			});
			this.setFilePath(path, false, router);
			// }
		},

		back() {
			if (this.backStack.length == 0) {
				return;
			}

			const path = this.backStack.pop();

			if (path) {
				this.previousStack.push(path);
				this.setFilePath(path, true);
			}
		},
		previous() {
			if (this.previousStack.length == 0) {
				return;
			}

			const path = this.previousStack.pop();

			if (path) {
				this.backStack.push(path);
				this.setFilePath(path, true);
			}
		},

		addSelected(value: any) {
			this.selected.push(value);
		},

		removeSelected(value: any) {
			const i = this.selected.indexOf(value);
			if (i === -1) return;
			this.selected.splice(i, 1);
		},

		resetSelected() {
			this.selected = [];
		},

		async formatRepotoPath(value) {
			return await getAPI(value.driveType).formatRepotoPath(value);
		},

		async formatPathtoUrl(value: FilePath) {
			return await getAPI(value.driveType).formatPathtoUrl(value);
		},

		async openPreviewDialog(path) {
			if (this.selected.length === 1) {
				const item = this.currentFileList.find(
					(item) => item.index === this.selected[0]
				);
				await getAPI(path.driveType)
					.openPreview(item)
					.then((res) => {
						console.log('ress', res);
						this.previewItem = res;
					});
			}
		},

		getDownloadURL(file: FileItem, inline: boolean, download = false): string {
			return getAPI(file.driveType).getDownloadURL(file, inline, download);
		},

		getPreviewURL(file: FileItem, size: string): string {
			return getAPI(file.driveType).getPreviewURL(file, size);
		}
	}
});
