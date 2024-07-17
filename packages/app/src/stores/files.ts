import { defineStore } from 'pinia';
import { Origin } from '../api/origin';
import { Data as DriveData } from '../api/drive/data';
import { Data as SyncData } from '../api/sync/data';
import { FilesSortType } from '../utils/contact';

export enum DriveType {
	Drive = 'drive',
	Sync = 'sync',
	Data = 'data',
	Cache = 'cache',
	GoogleDrive = 'googleDrive',
	Dropbox = 'dropbox'
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
	modified: number;
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
	modified: number;
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
	activeSort: {
		by: FilesSortType;
		asc: boolean;
	};
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
			previewItem: {},
			activeSort: {
				by: FilesSortType.Modified,
				asc: true
			}
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
		async setFilePath(path: FilePath, isBack = false) {
			console.log('setFilePath', path);
			// this.selected = [];
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

			const params = new URLSearchParams(path.param);
			const query = Object.fromEntries(params);

			this.router.push({
				path: path.path,
				query
			});

			const requestUrl = await this.formatPathtoUrl(path);

			console.log('driveType', path.driveType);
			console.log('requestUrl', requestUrl);

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

		setBrowserUrl(url: string, driveType: DriveType = DriveType.Drive) {
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
			this.setFilePath(path, false);
			// }
		},

		updateActiveSort(type: FilesSortType, asc: boolean) {
			this.activeSort = {
				by: type,
				asc
			};
			this.currentFileList = this.sortList(this.currentFileList);
		},

		sortList(list: any) {
			if (list) {
				const list1 = list.sort((a, b) => {
					if (this.activeSort.by == FilesSortType.TYPE) {
						return this.activeSort.asc
							? a.type.localeCompare(b.type)
							: -a.type.localeCompare(b.type);
					} else if (this.activeSort.by == FilesSortType.NAME) {
						return this.activeSort.asc
							? a.name.localeCompare(b.name)
							: -a.name.localeCompare(b.name);
					} else if (this.activeSort.by == FilesSortType.SIZE) {
						return this.activeSort.asc ? a.size - b.size : b.size - a.size;
					} else {
						if (typeof a.modified == 'string') {
							return this.activeSort.asc
								? a.modified.localeCompare(b.modified)
								: -a.modified.localeCompare(b.modified);
						} else {
							return this.activeSort.asc
								? a.modified - b.modified
								: b.modified - a.modified;
						}
					}
				});
				return list1;
			}
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
			console.log('openPreviewDialog', path);
			console.log('selected', this.selected);
			console.log('selected', this.selectedCount);

			if (this.selectedCount === 1) {
				const item = this.currentFileList.find(
					(item) => item.index === this.selected[0]
				);

				console.log('itemitem', item);
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
