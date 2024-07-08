import { defineStore } from 'pinia';
import { useRouter } from 'vue-router';
import { Origin } from '../api/origin';
import { Data as DriveData } from '../api/drive/data';
import { Data as SyncData } from '../api/sync/data';

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
	index?: number;
	url?: string;

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
			cached: {}
		} as FileState;
	},
	getters: {
		currentFileItems(): FileItem[] {
			return this.currentFileList.filter((item) => !item.isDir);
		},

		currentDirItems(): FileItem[] {
			return this.currentFileList.filter((item) => item.isDir);
		}
	},
	actions: {
		setFilePath(path: FilePath, isBack = false) {
			if (!path.isDir) {
				// We need to invoke the preview dialog here, rather than modifying the route.

				this.isInPreview = true;
				// openPreviewDialog( item )
				return;
			}

			const router = useRouter();
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

			router.push({
				path: path.path
			});

			getAPI(path.driveType)
				.fetch(path.path)
				.then((items: any) => {
					if (
						path.driveType == this.currentPath.driveType &&
						path.path == this.currentPath.path &&
						path.param == this.currentPath.param
					) {
						this.currentFileList = items;
					}
					this.cached[key] = items;
				})
				.catch((error) => {
					console.error('Error fetching items', error);
				});
		},
		setBrowserUrl(url: string) {
			// get url

			if (url.endsWith('')) {
				//
			} else {
				const path = new FilePath({
					path: url,
					param: '',
					isDir: true,
					driveType: DriveType.Drive
				});
				this.setFilePath(path);
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
		}
	}
});
