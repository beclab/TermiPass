import { Origin } from './../origin';
import { removePrefix } from '../utils';
import {
	checkOrigin,
	OriginType,
	DriveResType,
	CopyStoragesType
} from '../common/encoding';
import { getAppDataPath, isAppData } from '../../utils/file';
import { formatAppDataNode } from '../../utils/appdata';
import { MenuItem } from './../../utils/contact';
import { OPERATE_ACTION } from './../../utils/contact';
import { RouteLocationNormalizedLoaded } from 'vue-router';
import { useDataStore } from './../../stores/data';
import { files } from './../index';
import { useSeahubStore } from '../../stores/seahub';
import { formatSeahub } from '../../utils/seahub';
import { checkAppData } from '../../utils/file';
import { checkConflict } from '../../utils/upload';
import { notifyWaitingShow, notifyHide } from '../../utils/notifyRedefinedUtil';

import { SyncRepoItemType, SyncRepoSharedItemType } from './../common/encoding';

import { CommonFetch } from '../fetch';

class Data extends Origin {
	private commonAxios: any;

	constructor() {
		super();
		this.commonAxios = CommonFetch;
	}

	async fetch(url: string): Promise<DriveResType> {
		url = decodeURIComponent(removePrefix(url));
		let res: DriveResType | any;

		switch (checkOrigin(url)) {
			case OriginType.DRIVE:
				res = await this.fetchDrive(url);
				break;

			case OriginType.CACHE:
				res = await this.fetchCache(url);
				break;
		}

		console.log('resresres0', res);

		res.url = `/Files${url}`;

		if (res.isDir) {
			if (!res.url.endsWith('/')) res.url += '/';
			res.items = res.items.map((item, index) => {
				item.index = index;
				item.url = `${res.url}${encodeURIComponent(item.name)}`;
				if (item.isDir) {
					item.url += '/';
				}

				return item;
			});
		}

		console.log('resresres', res);

		return res;
	}

	async fetchSync(url: string): Promise<DriveResType> {
		const seahubStore = useSeahubStore();
		const currentItem = seahubStore.repo_name;
		const pathLen = url.indexOf(currentItem) + currentItem.length;
		const path = url.slice(pathLen);
		const res = await this.commonAxios.get(
			`seahub/api/v2.1/repos/${seahubStore.repo_id}/dir/?p=${path}&with_thumbnail=true`,
			{}
		);

		const data: DriveResType = formatSeahub(
			url,
			JSON.parse(JSON.stringify(res))
		);

		console.log('fetchSyncfetchSync', data);

		return data;
	}

	async fetchDrive(url: string): Promise<DriveResType> {
		let res: DriveResType;
		res = await this.commonAxios.get(`/api/resources${url}`, {});

		if (isAppData(url)) {
			res = formatAppDataNode(url, JSON.parse(JSON.stringify(res)));
		}
		return res;
	}

	async fetchCache(url: string): Promise<DriveResType> {
		const { path, node } = getAppDataPath(url);
		const res: DriveResType = await this.commonAxios.get(
			`/api/resources/AppData${path}`,
			{},
			{ auth: true, node }
		);

		return res;
	}

	async fetchSyncRepo(
		menu: string
	): Promise<SyncRepoItemType[] | SyncRepoSharedItemType[][] | undefined> {
		if (menu != MenuItem.SHAREDWITH && menu != MenuItem.MYLIBRARIES) {
			return undefined;
		}

		if (menu == MenuItem.MYLIBRARIES) {
			const res: any = await this.commonAxios.get(
				'/seahub/api/v2.1/repos/?type=mine',
				{}
			);

			const repos: SyncRepoItemType[] = res.repos;
			return repos;
		} else {
			const res2: any = await this.commonAxios.get(
				'/seahub/api/v2.1/shared-repos/',
				{}
			);
			const res3: any = await this.commonAxios.get(
				'/seahub/api/v2.1/repos/?type=shared',
				{}
			);

			const repos2: SyncRepoSharedItemType[] = res2;
			const repos3: SyncRepoSharedItemType[] = res3.repos;

			return [repos2, repos3];
		}
	}

	async dowload(path: string): Promise<{ url: string; headers: any }> {
		console.log(path);

		const dataStore = useDataStore();
		console.log('pathpath', path);

		if (
			dataStore.selectedCount === 1 &&
			!dataStore.req.items[dataStore.selected[0]].isDir
		) {
			const { url, node } = await files.download(
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
		const dataStore = useDataStore();
		const seahubStore = useSeahubStore();
		const copyStorages: CopyStoragesType[] = [];
		for (const item of dataStore.selected) {
			const el = dataStore.req.items[item];
			let from = decodeURIComponent(el.url).slice(6);
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

		return {
			items: copyStorages,
			from: OriginType.DRIVE
		};
	}

	async cut(): Promise<{ items: CopyStoragesType[]; from: OriginType }> {
		const dataStore = useDataStore();
		const seahubStore = useSeahubStore();
		const copyStorages: CopyStoragesType[] = [];
		for (const item of dataStore.selected) {
			const el = dataStore.req.items[item];
			let from = decodeURIComponent(el.url).slice(6);
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

		return {
			items: copyStorages,
			from: OriginType.DRIVE
		};
	}

	async paste(
		route: RouteLocationNormalizedLoaded,
		callback: (action: OPERATE_ACTION, data: any) => Promise<void>
	): Promise<void> {
		const dataStore = useDataStore();
		const items: CopyStoragesType[] = [];

		for (let i = 0; i < dataStore.copyFiles.items.length; i++) {
			const element: any = dataStore.copyFiles.items[i];
			let to =
				decodeURIComponent(route.path).slice(6) +
				decodeURIComponent(element.name);

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
	): Promise<void> {
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

	uploadFiles(): void {
		let element: any = null;
		element = document.getElementById('upload-input');
		element.value = '';
		element.removeAttribute('webkitdirectory');
		element.click();
	}

	uploadFolder(): void {
		let element: any = null;
		element = document.getElementById('upload-folder-input');
		element.value = '';
		element.setAttribute('webkitdirectory', 'webkitdirectory');
		element.click();
	}

	openLocalFolder(): string | undefined {
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

// const DriveDataAPI = new Data();

export { Data };
