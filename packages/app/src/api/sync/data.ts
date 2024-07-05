import { Origin } from './../origin';
import { removePrefix } from '../utils';
import {
	OriginType,
	DriveResType,
	CopyStoragesType,
	DriveItemType
} from '../common/encoding';
import { formatSeahub } from '../../utils/seahub';
import { MenuItem } from './../../utils/contact';
import { OPERATE_ACTION } from './../../utils/contact';
import { useDataStore } from './../../stores/data';
import { files, seahub } from './../index';
import { useSeahubStore } from '../../stores/seahub';
import { checkConflict } from '../../utils/upload';
import { notifyWaitingShow, notifyHide } from '../../utils/notifyRedefinedUtil';

import {
	SyncRepoItemType,
	SyncRepoSharedItemType,
	ShareInfoResType
} from './../common/encoding';

import { CommonFetch } from '../fetch';

class Data extends Origin {
	public commonAxios: any;

	constructor() {
		super();
		this.commonAxios = CommonFetch;
	}

	async fetch(url: string): Promise<DriveResType> {
		url = decodeURIComponent(removePrefix(url));
		const res: DriveResType = await this.fetchSync(url);
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

		return data;
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

	async fetchShareInfo(repo_id: string): Promise<ShareInfoResType> {
		const res: ShareInfoResType = await this.commonAxios.get(
			`/seahub/api/v2.1/repos/${repo_id}/share-info/`,
			{}
		);
		return res;
	}

	async download(path: string): Promise<{ url: string; headers: any }> {
		const dataStore = useDataStore();
		if (
			dataStore.selectedCount === 1 &&
			!dataStore.req.items[dataStore.selected[0]].isDir
		) {
			const url = await seahub.downloaFile(
				dataStore.req.items[dataStore.selected[0]].path
			);
			return { url: url, headers: {} };
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
			const pathFromStart =
				decodeURIComponent(el.url).indexOf(seahubStore.repo_name) +
				seahubStore.repo_name.length;
			const pathFromEnd = decodeURIComponent(el.url).indexOf(el.name) - 1;
			const from =
				'/' +
				seahubStore.repo_id +
				'/' +
				decodeURIComponent(el.url).slice(pathFromStart, pathFromEnd) +
				el.name;
			copyStorages.push({
				from: from,
				to: '',
				name: el.name,
				src_repo_id: seahubStore.repo_id || undefined
			});
		}

		console.log('sync-copyStorages', copyStorages);

		return {
			items: copyStorages,
			from: OriginType.SYNC
		};
	}

	async cut(): Promise<{ items: CopyStoragesType[]; from: OriginType }> {
		const dataStore = useDataStore();
		const seahubStore = useSeahubStore();
		const copyStorages: CopyStoragesType[] = [];
		for (const item of dataStore.selected) {
			const el = dataStore.req.items[item];
			const pathFromStart =
				decodeURIComponent(el.url).indexOf(seahubStore.repo_name) +
				seahubStore.repo_name.length;
			const pathFromEnd = decodeURIComponent(el.url).indexOf(el.name) - 1;
			const from =
				'/' +
				seahubStore.repo_id +
				'/' +
				decodeURIComponent(el.url).slice(pathFromStart, pathFromEnd) +
				el.name;
			copyStorages.push({
				from: from,
				to: '',
				name: el.name,
				src_repo_id: seahubStore.repo_id || undefined,
				key: 'x'
			});
		}

		return {
			items: copyStorages,
			from: OriginType.SYNC
		};
	}

	async paste(
		path: string,
		callback: (action: OPERATE_ACTION, data: any) => Promise<void>
	): Promise<void> {
		const dataStore = useDataStore();
		const seahubStore = useSeahubStore();
		const items: CopyStoragesType[] = [];

		for (let i = 0; i < dataStore.copyFiles.items.length; i++) {
			const element: any = dataStore.copyFiles.items[i];
			const pathFromStart =
				decodeURIComponent(path).indexOf(seahubStore.repo_name) +
				seahubStore.repo_name.length;
			const to =
				'/' +
				(seahubStore.repo_id || '') +
				decodeURIComponent(path).slice(pathFromStart) +
				decodeURIComponent(element.name);
			items.push({
				from: element.from,
				to: to,
				name: element.name,
				src_repo_id: element.src_repo_id || undefined
			});
			if (path + decodeURIComponent(element.name) === element.from) {
				this.action(false, true, items, path, false, callback);
				// dataStore.resetCopyFiles();
				return;
			}
		}
		const dstItems = (await dataStore.fetchList(path))!.items;
		const conflict = checkConflict(items, dstItems);
		let overwrite = false;
		let rename = true;
		let isMove = false;

		console.log('sync-dataStorecopyFiles-items', items);

		if (dataStore.copyFiles.items[0].key === 'x') {
			overwrite = true;
			isMove = true;
		}
		if (conflict) {
			rename = true;
		}
		this.action(overwrite, rename, items, path, isMove, callback);
	}

	async move(
		path: string,
		callback: (action: OPERATE_ACTION, data: any) => Promise<void>
	): Promise<void> {
		const dataStore = useDataStore();
		const seahubStore = useSeahubStore();
		const items: CopyStoragesType[] = [];
		for (const i of dataStore.selected) {
			const element: any = dataStore.req.items[i];
			const fromStart =
				decodeURIComponent(element.url).indexOf(seahubStore.repo_name) +
				seahubStore.repo_name.length;
			const formEnd = decodeURIComponent(element.url).indexOf(element.name);
			const from =
				'/' +
				seahubStore.repo_id +
				decodeURIComponent(element.url).slice(fromStart, formEnd) +
				element.name;
			const toStart =
				decodeURIComponent(path).indexOf(seahubStore.repo_name) +
				seahubStore.repo_name.length;
			const to =
				'/' +
				seahubStore.repo_id +
				decodeURIComponent(path).slice(toStart) +
				element.name;
			items.push({
				from: from,
				to: to,
				name: element.name,
				src_repo_id: seahubStore.repo_id
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

	async openPreview(item: any): Promise<void> {
		console.log('into sync');

		console.log('item start', item);
		const dataStore = useDataStore();
		item.url = item.path;
		// item.path = item.path.slice(6) + item.name + '/';
		item = await this.formatFileContent(item);
		console.log('item end', item);

		dataStore.updateRequest(item);
	}

	getPreviewURL(file: any, thumb: string): string {
		const dataStore = useDataStore();
		const startIndex =
			file.path.indexOf(file.repo_name) + file.repo_name?.length;

		const hasSeahub = file.path.slice(startIndex);

		let seflSize = '1080';
		if (thumb === 'thumb') {
			seflSize = '48';
		}

		return `${dataStore.baseURL()}/seahub/thumbnail/${
			file.repo_id
		}/${seflSize}${hasSeahub}`;
	}

	getDownloadURL(file: any, download?: boolean): string {
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

	async formatFileContent(file: DriveItemType): Promise<DriveItemType> {
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

	async openFile(file: DriveItemType): Promise<void> {
		const store = useDataStore();
		const item = await this.formatFileContent(file);
		console.log('checkSeahub file', item);
		store.updateRequest(item);
	}
}

export { Data };
