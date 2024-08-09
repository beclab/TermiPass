import { defineStore } from 'pinia';
import { Origin } from '../api/origin';

import { dataAPIs } from '../api';

import { FilesSortType } from '../utils/contact';
import { useMenuStore } from './files-menu';
import { formatUrltoActiveMenu } from 'src/api/common/common';
export enum DriveType {
	Drive = 'drive',
	Sync = 'sync',
	Data = 'data',
	Cache = 'cache',
	CloudDrive = 'cloudDrive',
	GoogleDrive = 'google',
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

function getAPI(driveType: DriveType): Origin {
	return dataAPIs(driveType);
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
			return this.currentFileList?.filter((item) => !item.isDir);
		},

		currentDirItems(): FileItem[] {
			return this.currentFileList?.filter((item) => item.isDir);
		},

		selectedCount: (state) => state.selected.length,

		hasPrevPath(state): boolean {
			return state.previousStack && state.previousStack.length > 0
				? true
				: false;
		},

		hasBackPath(state): boolean {
			return state.backStack && state.backStack.length > 0 ? true : false;
		},

		getCurrentRepo(state): string {
			if (this.backStack.length == 0) {
				return '0';
			}
			const isEndWith =
				state.backStack[state.backStack.length - 1].path.endsWith('/');
			const currentPath = decodeURIComponent(
				state.backStack[state.backStack.length - 1].path
			).split('/');
			return currentPath.length < 1
				? ''
				: currentPath[
						isEndWith ? currentPath.length - 2 : currentPath.length - 1
				  ];
		}
	},
	actions: {
		async setFilePath(path: FilePath, isBack = false, isPrev = true) {
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

			if (!isBack && isPrev) {
				this.backStack.push(path);
				this.previousStack = [];
			}

			const params = new URLSearchParams(path.param);
			const query = Object.fromEntries(params);

			console.log('pathpathpath1', path);

			this.router.push({
				path: path.path,
				query
			});

			console.log('request path', path);

			const requestUrl = await this.formatPathtoUrl(path);

			console.log('requestUrlrequestUrl', requestUrl);

			const menuStore = useMenuStore();
			menuStore.activeMenu = await formatUrltoActiveMenu(
				path.path + path.param
			);

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

		async back() {
			console.log('this.backStack.length ===>', this.backStack.length);
			const path = this.backStack.pop();
			if (this.backStack.length == 0 && process.env.PLATFORM == 'MOBILE') {
				return;
			}
			const initPath = new FilePath({
				path: '/Files/Home',
				param: '',
				isDir: true,
				driveType: DriveType.Drive
			});

			console.log('pathpathpath', path);
			const currentPath = this.backStack[this.backStack.length - 1] || initPath;

			console.log('currentPathcurrentPath', currentPath);

			if (path) {
				this.previousStack.push(path);
				this.setFilePath(currentPath, true);
			}
		},

		previous() {
			console.log('previousStackpreviousStack', this.previousStack);
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
			return await getAPI(value.driveType).formatPathtoUrl(
				value.path,
				value.param
			);
		},

		async openPreviewDialog(path) {
			this.previewItem = {};
			if (this.selectedCount === 1) {
				const item = this.currentFileList.find(
					(item) => item.index === this.selected[0]
				);

				await getAPI(path.driveType)
					.openPreview(item)
					.then(async (res) => {
						console.log('previewItempreviewItem', res);
						res.path = await getAPI(path.driveType).formatPathtoUrl(res.path);
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
