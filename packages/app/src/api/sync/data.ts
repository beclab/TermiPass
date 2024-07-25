import { Origin } from './../origin';
import { MenuItem } from './../../utils/contact';
import { OPERATE_ACTION } from './../../utils/contact';
import { useDataStore } from './../../stores/data';
import { files, seahub } from './../index';
import { useSeahubStore } from '../../stores/seahub';
import { notifyWaitingShow, notifyHide } from '../../utils/notifyRedefinedUtil';

import { ShareInfoResType, SyncRepoSharedType, SyncRepoMineType } from './type';

import { formatSeahub } from './filesFormat';
import { getParams } from './../../utils/utils';
import { useFilesStore } from './../../stores/files';
import { useMenuStore } from './../../stores/files-menu';

import { useOperateinStore, CopyStoragesType } from 'src/stores/operation';

import {
	FileItem,
	FileResType,
	DriveType,
	FilePath
} from './../../stores/files';
import { fetchRepo } from './sync';

import { CommonFetch } from '../fetch';

class Data extends Origin {
	public commonAxios: any;

	constructor() {
		super();
		this.commonAxios = CommonFetch;
	}

	async fetch(url: string): Promise<FileResType> {
		console.log('sync fetch', url);

		url = decodeURIComponent(url);
		const res: FileResType = await this.fetchSync(url);
		res.url = `/Files${url}`;
		if (res.isDir) {
			if (!res.url.endsWith('/')) res.url += '/';
			res.items = res.items.map((item, index) => {
				item.index = index;
				item.url =
					url.split('p=/')[0] +
					'p=/' +
					encodeURIComponent(item.name) +
					url.split('p=/')[1];
				// if (item.isDir) {
				// 	item.url += '/';
				// }
				return item;
			});
		}

		return res;
	}

	async fetchSync(url: string): Promise<FileResType> {
		const res = await this.commonAxios.get(url, {});

		const data: FileResType = formatSeahub(
			url,
			JSON.parse(JSON.stringify(res))
		);

		console.log('fetchsync -->', data);

		return data;
	}

	async fetchMenuRepo(): Promise<SyncRepoMineType[]> {
		const [res2, res3]: any = await fetchRepo(MenuItem.SHAREDWITH);
		const shareChildren: SyncRepoSharedType[] = [];
		for (let i = 0; i < res2.length; i++) {
			const el = res2[i];
			const hsaShareRepo = shareChildren.find((item) => item.id === el.repo_id);
			if (hsaShareRepo) {
				continue;
			}

			shareChildren.push({
				label: el.repo_name,
				key: el.repo_id,
				icon: 'sym_r_folder_shared',
				id: el.repo_id,
				defaultHide: true,
				driveType: DriveType.Sync,
				...el
			});
		}

		const sharedme: SyncRepoSharedType[] = [];
		for (let i = 0; i < res3.length; i++) {
			const el = res3[i];
			sharedme.push({
				label: el.repo_name,
				key: el.repo_id,
				name: el.repo_name,
				icon: 'sym_r_folder_supervised',
				id: el.repo_id,
				defaultHide: true,
				driveType: DriveType.Sync,
				...el
			});
		}

		const res1: any = await fetchRepo(MenuItem.MYLIBRARIES);
		const mineChildren: SyncRepoMineType[] = [];
		for (let i = 0; i < res1.length; i++) {
			const el = res1[i];

			const hasShareWith = shareChildren.find(
				(item) => item.repo_id === el.repo_id
			);
			const hasShareMe = sharedme.find((item) => item.repo_id === el.repo_id);
			const hasShare = hasShareWith || hasShareMe;

			mineChildren.push({
				label: el.repo_name,
				key: el.repo_id,
				icon: 'sym_r_folder',
				id: el.repo_id,
				name: el.repo_name,
				shard_user_hide_flag: hasShare ? false : true,
				share_type: hasShare ? hasShare.share_type : undefined,
				user_email: hasShare ? hasShare.user_email : undefined,
				defaultHide: true,
				driveType: DriveType.Sync,
				...el
			});
		}

		const myLibraries = {
			label: MenuItem.MYLIBRARIES,
			key: 'MyLibraries',
			icon: '',
			expationFlag: true,
			muted: true,
			disableClickable: true,
			driveType: DriveType.Sync
		};
		const shardWith = {
			label: MenuItem.SHAREDWITH,
			key: 'SharedLibraries',
			icon: '',
			expationFlag: false,
			muted: true,
			disableClickable: true,
			driveType: DriveType.Sync
		};

		let shardArr: any = [];
		if (shareChildren.length > 0 || sharedme.length > 0) {
			shardArr = [shardWith, ...shareChildren, ...sharedme];
		}

		const syncMenu = [myLibraries, ...mineChildren, ...shardArr];

		return syncMenu;
	}

	async fetchShareInfo(repo_id: string): Promise<ShareInfoResType> {
		const res: ShareInfoResType = await this.commonAxios.get(
			`/seahub/api/v2.1/repos/${repo_id}/share-info/`,
			{}
		);
		return res;
	}

	async download(path: string): Promise<{ url: string; headers: any }> {
		console.log('sync download', path);

		// const dataStore = useDataStore();
		const fileStore = useFilesStore();
		if (
			fileStore.selectedCount === 1 &&
			!fileStore.currentFileList[fileStore.selected[0]].isDir
		) {
			const url = await seahub.downloaFile(
				fileStore.currentFileList[fileStore.selected[0]].path
			);
			return { url: url, headers: {} };
		}

		const filesDownload: any[] = [];

		if (fileStore.selectedCount > 0) {
			for (const i of fileStore.selected) {
				filesDownload.push(fileStore.currentFileList[i].url);
			}
		} else {
			filesDownload.push(path);
		}

		const { url, node } = files.download('zip', ...filesDownload);

		const headers = {
			'Content-Type': 'application/octet-stream'
		};
		if (node) {
			headers['X-Terminus-Node'] = node;
		}

		return { url, headers };
	}

	async copy(): Promise<CopyStoragesType[]> {
		const fileStore = useFilesStore();
		const menuStore = useMenuStore();
		const copyStorages: CopyStoragesType[] = [];
		for (const item of fileStore.selected) {
			const el = fileStore.currentFileList[item];
			const pathFromStart =
				decodeURIComponent(el.path).indexOf(menuStore.activeMenu.label) +
				menuStore.activeMenu.label.length;

			const pathFromEnd = decodeURIComponent(el.path).indexOf('?');
			const repo_id = getParams(el.path, 'id');

			const from =
				'/' +
				repo_id +
				decodeURIComponent(el.path).slice(pathFromStart, pathFromEnd) +
				el.name;

			copyStorages.push({
				from: from,
				to: '',
				name: el.name,
				src_drive_type: DriveType.Sync
			});
		}

		console.log('sync-copyStorages', copyStorages);

		return copyStorages;
	}

	async cut(): Promise<CopyStoragesType[]> {
		const fileStore = useFilesStore();
		const menuStore = useMenuStore();
		const copyStorages: CopyStoragesType[] = [];

		for (const item of fileStore.selected) {
			const el = fileStore.currentFileList[item];
			const pathFromStart =
				decodeURIComponent(el.path).indexOf(menuStore.activeMenu.label) +
				menuStore.activeMenu.label.length;

			const pathFromEnd = decodeURIComponent(el.path).indexOf('?');
			const repo_id = getParams(el.path, 'id');

			const from =
				'/' +
				repo_id +
				decodeURIComponent(el.path).slice(pathFromStart, pathFromEnd) +
				el.name;
			copyStorages.push({
				from: from,
				to: '',
				name: el.name,
				src_drive_type: DriveType.Sync,
				key: 'x'
			});
		}

		return copyStorages;
	}

	async paste(
		path: string,
		callback: (action: OPERATE_ACTION, data: any) => Promise<void>
	): Promise<void> {
		const operateinStore = useOperateinStore();
		const menuStore = useMenuStore();
		const items: CopyStoragesType[] = [];
		for (let i = 0; i < operateinStore.copyFiles.length; i++) {
			const el: any = operateinStore.copyFiles[i];

			const repo_id = getParams(path, 'id');
			const pathFromStart =
				decodeURIComponent(path).indexOf(menuStore.activeMenu.label) +
				menuStore.activeMenu.label.length;
			const pathFromEnd = decodeURIComponent(path).indexOf('?');

			const to =
				'/' +
				repo_id +
				decodeURIComponent(path).slice(pathFromStart, pathFromEnd) +
				el.name;
			items.push({
				from: el.from,
				to: to,
				name: el.name,
				src_drive_type: el.src_drive_type,
				dst_drive_type: DriveType.Sync
			});
			if (path + decodeURIComponent(el.name) === el.from) {
				this.action(false, true, items, path, false, callback);
				return;
			}
		}
		let overwrite = false;
		const rename = true;
		let isMove = false;

		if (
			operateinStore.copyFiles[0] &&
			operateinStore.copyFiles[0].key === 'x'
		) {
			overwrite = true;
			isMove = true;
		}
		this.action(overwrite, rename, items, path, isMove, callback);
	}

	async move(
		path: string,
		callback: (action: OPERATE_ACTION, data: any) => Promise<void>
	): Promise<void> {
		console.log('move path', path);
		// const dataStore = useDataStore();
		const filesStore = useFilesStore();
		// const seahubStore = useSeahubStore();
		const menuStore = useMenuStore();
		const items: CopyStoragesType[] = [];
		for (const i of filesStore.selected) {
			const el: any = filesStore.currentFileList[i];

			const pathFromStart =
				decodeURIComponent(el.path).indexOf(menuStore.activeMenu.label) +
				menuStore.activeMenu.label.length;

			const pathFromEnd = decodeURIComponent(el.path).indexOf('?');
			const repo_id = getParams(el.path, 'id');

			const from =
				'/' +
				repo_id +
				decodeURIComponent(el.path).slice(pathFromStart, pathFromEnd) +
				el.name;

			const toStart =
				decodeURIComponent(path).indexOf(menuStore.activeMenu.label) +
				menuStore.activeMenu.label.length;
			const toEnd = decodeURIComponent(path).indexOf('?');
			const to =
				'/' +
				repo_id +
				decodeURIComponent(path).slice(toStart, toEnd) +
				el.name;

			items.push({
				from: from,
				to: to,
				name: el.name,
				src_drive_type: el.driveType,
				dst_drive_type: DriveType.Sync
			});
		}
		const overwrite = true;
		this.action(overwrite, true, items, path, true, callback);
	}

	async action(
		overwrite: boolean | undefined,
		rename: boolean | undefined,
		items: CopyStoragesType[],
		path: string,
		isMove: boolean | undefined,
		callback: (action: OPERATE_ACTION, data: any) => Promise<void>
	): Promise<void> {
		const dest = path;

		notifyWaitingShow('Pasting, Please wait...');

		if (isMove) {
			await files
				.move(items, overwrite, rename)
				.then(() => {
					callback(OPERATE_ACTION.MOVE, dest);
					notifyHide();
				})
				.catch(() => {
					notifyHide();
				});
		} else {
			await files
				.copy(items, overwrite, rename)
				.then(() => {
					callback(OPERATE_ACTION.PASTE, dest);
					notifyHide();
				})
				.catch(() => {
					notifyHide();
				});
		}
	}

	uploadFiles(): void {
		let element: any = null;
		element = document.getElementById('uploader-input');
		element.value = '';
		element.removeAttribute('webkitdirectory');
		element.click();
	}

	uploadFolder(): void {
		let element: any = null;
		element = document.getElementById('uploader-input');
		element.value = '';
		element.setAttribute('webkitdirectory', 'webkitdirectory');
		element.click();
	}

	openLocalFolder(): string | undefined {
		const filesStore = useFilesStore();
		const seahubStore = useSeahubStore();
		const item = filesStore.currentFileList[filesStore.selected[0]];
		if (!item.isDir) {
			return undefined;
		}
		const itemUrl = decodeURIComponent(item.url);
		const pathFromStart =
			itemUrl.indexOf(seahubStore.repo_name) + seahubStore.repo_name.length;
		const path = itemUrl.slice(pathFromStart, itemUrl.length - 1);
		return path;
	}

	async openPreview(item: any): Promise<FileResType> {
		console.log('openPreview', item);
		item.url = item.path;
		item = await this.formatFileContent(item);

		console.log('openPreview sync', item);
		item.driveType = DriveType.Sync;

		return item;
		// dataStore.updateRequest(item);
	}

	getPreviewURL(file: any, thumb: string): string {
		const dataStore = useDataStore();
		const repo_id = getParams(file.path, 'id');
		let seflSize = '1080';
		if (thumb === 'thumb') {
			seflSize = '48';
		}

		return `${dataStore.baseURL()}/seahub/thumbnail/${repo_id}/${seflSize}/${
			file.name
		}`;
	}

	getDownloadURL(file: any, _inline: boolean, download?: boolean): string {
		const store = useDataStore();
		const startIndex =
			file.path.indexOf(file.repo_name) + file.repo_name?.length;
		const hasSeahub = file.path.slice(startIndex);
		if (['audio', 'video'].includes(file.type) && !download) {
			return file.url;
		} else {
			return `${store.baseURL()}/seahub/lib/${
				file.repo_id
			}/file${hasSeahub}?dl=1`;
		}
	}

	async formatFileContent(file: FileItem): Promise<FileItem> {
		const store = useDataStore();
		const seahubStore = useSeahubStore();

		if (
			!['audio', 'video', 'text', 'txt', 'textImmutable', 'pdf'].includes(
				file.type
			)
		) {
			return file;
		}

		const currentItemLength = store.currentItem.length;
		const startIndex = file.path.indexOf(store.currentItem) + currentItemLength;
		const hasSeahub = file.path.slice(startIndex);

		const res = await this.commonAxios.get(
			`/seahub/lib/${seahubStore.repo_id}/file${hasSeahub}?dict=1`,
			{}
		);

		if (['audio', 'video', 'pdf'].includes(file.type)) {
			file.url = store.baseURL() + res.data.raw_path;
		} else if (['text', 'txt', 'textImmutable'].includes(file.type)) {
			file.content = res.data.file_content;
		}

		return file;
	}

	async formatRepotoPath(item: any): Promise<string> {
		return `/Files/Seahub/${item.label}/?id=${item.id}&type=${
			item.type || 'mine'
		}&p=${item.permission ? item.permission.trim() : 'rw'}`;
	}

	async formatPathtoUrl(item: FilePath): Promise<string> {
		const repo_id = getParams(item.param, 'id');
		const pathList = item.path.split('/');
		let path = '';
		for (let i = 4; i < pathList.length; i++) {
			const p = pathList[i];
			path += `/${p}`;
		}

		return `/seahub/api/v2.1/repos/${repo_id}/dir/?p=${path}&with_thumbnail=true`;
	}

	async deleteItem(items: FileItem[]): Promise<void> {
		const menuStore = useMenuStore();
		const dirents: string[] = [];

		for (let i = 0; i < items.length; i++) {
			const item = items[i];
			dirents.push(item.name);
		}

		const parmas = {
			dirents: dirents,
			parent_dir: items[0].parentPath,
			repo_id: menuStore.activeMenu.id
		};

		await seahub.batchDeleteItem(parmas);
	}

	async renameItem(item: FileItem, newName: string): Promise<void> {
		const p = item.parentPath + item.name;
		const parmas = {
			operation: 'rename',
			newname: newName
		};
		const url = 'api/v2.1/repos';
		await seahub.fileOperate(p, url, parmas, item.isDir ? 'dir' : 'file');
	}

	async createDir(dirName: string, path: string): Promise<void> {
		const menuStore = useMenuStore();
		console.log('dirname ====>', dirName);
		console.log('path ====>', path);
		console.log(menuStore.activeMenu.label);

		const pathlen =
			decodeURIComponent(path).indexOf(menuStore.activeMenu.label) +
			menuStore.activeMenu.label.length;
		const p = `${decodeURIComponent(path).slice(pathlen)}${dirName}`;

		const parmas = {
			operation: 'mkdir'
		};
		const url = 'api2/repos';
		await seahub.fileOperate(p, url, parmas, 'dir');
	}
}

export { Data };
