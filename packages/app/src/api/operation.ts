import { RouteLocationNormalizedLoaded } from 'vue-router';
import { Fetch } from './fetch';
import { checkSeahub, checkAppData } from '../utils/file';
import { getParams } from './../utils/utils';
import { OPERATE_ACTION } from '../utils/contact';
import { notifyWaitingShow, notifyHide } from '../utils/notifyRedefinedUtil';
import { checkConflict } from './../utils/upload';

import { useDataStore } from '../stores/data';
import { useSeahubStore } from '../stores/seahub';

import { files, seahub } from './index';

import { CopyStoragesType, OriginType } from './common/encoding';

export class Operation extends Fetch {
	public fetchRes: any;

	constructor() {
		super();
	}

	async dowload(path: string): Promise<{ url: string; headers: any }> {
		const dataStore = useDataStore();
		console.log('pathpath', path);

		if (
			dataStore.selectedCount === 1 &&
			!dataStore.req.items[dataStore.selected[0]].isDir
		) {
			if (checkSeahub(dataStore.req.items[dataStore.selected[0]].path)) {
				const url = await seahub.downloaFile(
					dataStore.req.items[dataStore.selected[0]].path
				);
				return { url: url, headers: {} };
			}

			const { url, node } = files.download(
				null,
				dataStore.req.items[dataStore.selected[0]].url
			);

			const headers = {
				...dataStore.req.headers,
				'Content-Type': 'application/octet-stream'
			};
			if (node) {
				headers['X-Terminus-Node'] = node;
			}

			return { url, headers };
		}

		const filesDownload: any[] = [];

		if (dataStore.selectedCount > 0) {
			for (const i of dataStore.selected) {
				filesDownload.push(dataStore.req.items[i].url);
			}
		} else {
			filesDownload.push(path);
		}

		const { url, node } = files.download('zip', ...filesDownload);

		const headers = {
			...dataStore.req.headers,
			'Content-Type': 'application/octet-stream'
		};
		if (node) {
			headers['X-Terminus-Node'] = node;
		}

		return { url, headers };
	}

	async copy(): Promise<{ items: CopyStoragesType[]; from: OriginType }> {
		console.log('into copy');
		const dataStore = useDataStore();
		const seahubStore = useSeahubStore();
		const copyStorages: CopyStoragesType[] = [];
		for (const item of dataStore.selected) {
			const el = dataStore.req.items[item];
			let from = decodeURIComponent(el.url).slice(6);
			if (checkSeahub(el.url)) {
				const pathFromStart =
					decodeURIComponent(el.url).indexOf(seahubStore.repo_name) +
					seahubStore.repo_name.length;
				const pathFromEnd = decodeURIComponent(el.url).indexOf(el.name) - 1;
				from =
					'/' +
					seahubStore.repo_id +
					'/' +
					decodeURIComponent(el.url).slice(pathFromStart, pathFromEnd) +
					el.name;
			}
			if (checkAppData(el.url)) {
				from = decodeURIComponent(el.url);
			}
			copyStorages.push({
				from: from,
				to: '',
				name: el.name,
				src_repo_id: seahubStore.repo_id || undefined,
				parentPath: el.parentPath
			});
		}

		const isSeahub = checkSeahub(dataStore.req.url);

		return {
			items: copyStorages,
			from: isSeahub ? OriginType.SYNC : OriginType.DRIVE
		};
	}

	async cut(): Promise<{ items: CopyStoragesType[]; from: OriginType }> {
		const dataStore = useDataStore();
		const seahubStore = useSeahubStore();
		const copyStorages: CopyStoragesType[] = [];
		for (const item of dataStore.selected) {
			const el = dataStore.req.items[item];
			let from = decodeURIComponent(el.url).slice(6);
			if (checkSeahub(el.url)) {
				const pathFromStart =
					decodeURIComponent(el.url).indexOf(seahubStore.repo_name) +
					seahubStore.repo_name.length;
				const pathFromEnd = decodeURIComponent(el.url).indexOf(el.name) - 1;
				from =
					'/' +
					seahubStore.repo_id +
					'/' +
					decodeURIComponent(el.url).slice(pathFromStart, pathFromEnd) +
					el.name;
			}
			if (checkAppData(el.url)) {
				from = decodeURIComponent(el.url);
			}
			copyStorages.push({
				from: from,
				to: '',
				name: el.name,
				src_repo_id: seahubStore.repo_id || undefined,
				parentPath: el.parentPath,
				key: 'x'
			});
		}

		const isSeahub = checkSeahub(dataStore.req.url);

		return {
			items: copyStorages,
			from: isSeahub ? OriginType.SYNC : OriginType.DRIVE
		};
	}

	async paste(
		route: RouteLocationNormalizedLoaded,
		callback: (action: OPERATE_ACTION, data: any) => Promise<void>
	): Promise<void> {
		const dataStore = useDataStore();
		const seahubStore = useSeahubStore();
		const items: CopyStoragesType[] = [];

		for (let i = 0; i < dataStore.copyFiles.items.length; i++) {
			const element: any = dataStore.copyFiles.items[i];
			let to =
				decodeURIComponent(route.path).slice(6) +
				decodeURIComponent(element.name);

			if (checkSeahub(route.path)) {
				const pathFromStart =
					decodeURIComponent(route.path).indexOf(seahubStore.repo_name) +
					seahubStore.repo_name.length;
				to =
					'/' +
					(seahubStore.repo_id || '') +
					decodeURIComponent(route.path).slice(pathFromStart) +
					decodeURIComponent(element.name);
			}
			if (checkAppData(route.path)) {
				to = decodeURIComponent(route.path) + decodeURIComponent(element.name);
			}
			items.push({
				from: element.from,
				to: to,
				name: element.name,
				src_repo_id: element.src_repo_id || undefined,
				parentPath: element.parentPath
			});
			if (route.path + decodeURIComponent(element.name) === element.from) {
				this.action(false, true, items, route.path, false, callback);
				// dataStore.resetCopyFiles();
				return;
			}
		}
		const dstItems = (await dataStore.fetchList(route.path))!.items;
		const conflict = checkConflict(items, dstItems);
		let overwrite = false;
		let rename = true;
		let isMove = false;

		console.log('dataStorecopyFiles', dataStore.copyFiles);
		if (dataStore.copyFiles.items[0].key === 'x') {
			overwrite = true;
			isMove = true;
		}
		if (conflict) {
			rename = true;
		}
		this.action(overwrite, rename, items, route.path, isMove, callback);
	}

	async move(
		path: string,
		callback: (action: OPERATE_ACTION, data: any) => Promise<void>
	): Promise<void> {
		const dataStore = useDataStore();
		const seahubStore = useSeahubStore();
		const items: {
			from: any;
			to: string;
			name: any;
			src_repo_id?: any;
			parentPath: string;
		}[] = [];
		for (const i of dataStore.selected) {
			const element: any = dataStore.req.items[i];
			let from = decodeURIComponent(element.url).slice(6);
			let to = decodeURIComponent(path + element.name).slice(6);
			if (checkSeahub(element.url)) {
				const fromStart =
					decodeURIComponent(element.url).indexOf(seahubStore.repo_name) +
					seahubStore.repo_name.length;
				const formEnd = decodeURIComponent(element.url).indexOf(element.name);
				from =
					'/' +
					seahubStore.repo_id +
					decodeURIComponent(element.url).slice(fromStart, formEnd) +
					element.name;
				const toStart =
					decodeURIComponent(path).indexOf(seahubStore.repo_name) +
					seahubStore.repo_name.length;
				to =
					'/' +
					seahubStore.repo_id +
					decodeURIComponent(path).slice(toStart) +
					element.name;
			}
			if (checkAppData(element.url)) {
				from = decodeURIComponent(element.url);
				to = decodeURIComponent(path + element.name);
			}
			items.push({
				from: from,
				to: to,
				name: element.name,
				src_repo_id: seahubStore.repo_id,
				parentPath: element.parentPath
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
	) {
		const dataStore = useDataStore();
		const dest = path;

		notifyWaitingShow('Pasting, Please wait...');

		if (isMove) {
			await files
				.move(items, overwrite, rename)
				.then(() => {
					callback(OPERATE_ACTION.MOVE, dest);
					notifyHide();
					dataStore.setReload(true);
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
					dataStore.setReload(true);
				})
				.catch(() => {
					notifyHide();
				});
		}
	}

	uploadFiles() {
		const query = getParams(window.location.href, 'id');
		let element: any = null;
		if (query) {
			element = document.getElementById('uploader-input');
		} else {
			element = document.getElementById('upload-input');
		}

		element.value = '';
		element.removeAttribute('webkitdirectory');
		element.click();
	}

	uploadFolder() {
		const query = getParams(window.location.href, 'id');
		let element: any = null;
		if (query) {
			element = document.getElementById('uploader-input');
		} else {
			element = document.getElementById('upload-folder-input');
		}
		element.value = '';
		element.setAttribute('webkitdirectory', 'webkitdirectory');
		element.click();
	}

	openLocalFolder() {
		const dataStore = useDataStore();
		const seahubStore = useSeahubStore();
		const item = dataStore.req.items[dataStore.selected[0]];
		if (!item.isDir) {
			return undefined;
		}
		const itemUrl = decodeURIComponent(item.url);
		const pathFromStart =
			itemUrl.indexOf(seahubStore.repo_name) + seahubStore.repo_name.length;
		const path = itemUrl.slice(pathFromStart, itemUrl.length - 1);
		return path;
	}
}
