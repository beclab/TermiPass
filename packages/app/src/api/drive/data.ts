import { Router } from 'vue-router';
import { Origin } from './../origin';
import { removePrefix, createURL } from '../utils';
import {
	checkOrigin,
	OriginType,
	DriveResType,
	CopyStoragesType,
	SyncRepoSharedItemType,
	SyncRepoItemType,
	DriveItemType
} from '../common/encoding';
import { getAppDataPath, isAppData } from '../../utils/file';
import { formatAppDataNode } from '../../utils/appdata';
import { MenuItem } from './../../utils/contact';
import { OPERATE_ACTION } from './../../utils/contact';
import { useDataStore } from './../../stores/data';
import { files } from './../index';
import { useSeahubStore } from '../../stores/seahub';
import { formatSeahub } from '../../utils/seahub';
import { checkAppData } from '../../utils/file';
import { checkConflict } from '../../utils/upload';
import { notifyWaitingShow, notifyHide } from '../../utils/notifyRedefinedUtil';

import { CommonFetch } from '../fetch';

class Data extends Origin {
	public commonAxios: any;

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

	async download(path: string): Promise<{ url: string; headers: any }> {
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
				src_repo_id: seahubStore.repo_id || undefined
			});
		}

		console.log('copyStorages', copyStorages);

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
				key: 'x'
			});
		}

		return {
			items: copyStorages,
			from: OriginType.DRIVE
		};
	}

	async paste(
		path: string,
		callback: (action: OPERATE_ACTION, data: any) => Promise<void>
	): Promise<void> {
		const dataStore = useDataStore();
		const items: CopyStoragesType[] = [];

		console.log('dataStorecopyFiles', dataStore.copyFiles);

		for (let i = 0; i < dataStore.copyFiles.items.length; i++) {
			const element: any = dataStore.copyFiles.items[i];
			let to =
				decodeURIComponent(path).slice(6) + decodeURIComponent(element.name);

			if (checkAppData(path)) {
				to = decodeURIComponent(path) + decodeURIComponent(element.name);
			}
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

		console.log('dataStorecopyFiles-items', items);
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

	async fetchUploader(
		url: string,
		content: any,
		overwrite = false,
		timer = this.RETRY_TIMER,
		callback?: (event?: any) => void
	): Promise<void> {
		const newurl = removePrefix(decodeURIComponent(url));

		let fileInfo: any;
		let appNode = '';

		if (checkAppData(newurl)) {
			const { path, node } = getAppDataPath(newurl);
			appNode = node;
			if (node) {
				fileInfo = await files.getUploadInfo(path, `/appdata`, content);
			}
		} else {
			fileInfo = await files.getUploadInfo(newurl, '/data', content);
		}

		console.log('fileInfo', fileInfo);

		const fileChunkList = await files.createFileChunk(fileInfo, content);

		const exportProgress = (e) => {
			if (typeof callback === 'function') {
				callback(e);
			}
		};

		for (let i = 0; i < fileChunkList.length; i++) {
			const chunkFile = fileChunkList[i];
			try {
				await files.uploadChunks(
					fileInfo,
					chunkFile,
					i,
					exportProgress,
					appNode
				);
			} catch (error) {
				if (timer === 1) {
					exportProgress({
						loaded: -1,
						total: fileInfo.file_size,
						lengthComputable: true
					});
				}
				await files.errorRetry(url, content, overwrite, callback, timer);
			}
		}
	}

	openPreview(item: any, Router: Router): void {
		console.log('into drive');
		Router.push({
			path: item.path,
			query: {
				type: 'preview'
			}
		});
	}

	getPreviewURL(file: any, thumb: string): string {
		const params = {
			inline: 'true',
			key: Date.parse(file.modified)
		};

		return createURL('api/preview/' + thumb + file.path, params);
	}

	getDownloadURL(file: any, inline: boolean): string {
		const params = {
			...(inline && { inline: 'true' })
		};
		const url = createURL('api/raw' + file.path, params);
		return url;
	}

	async formatFileContent(file: DriveItemType): Promise<DriveItemType> {
		console.log('drive formatFileContent start', file);
		if (
			!['audio', 'video', 'text', 'txt', 'textImmutable', 'pdf'].includes(
				file.type
			)
		) {
			return file;
		}

		if (['text', 'txt', 'textImmutable'].includes(file.type)) {
			try {
				const url = decodeURIComponent(file.path);
				const res = await this.commonAxios.get(`/api/resources${url}`, {});

				console.log('formatFileContent', res);
				file.content = res.data.content;

				console.log('formatFileContent-file', file);
			} catch (error) {
				console.error(error.message);
			}
		}
		console.log('formatFileContent end', file);
		return file;
	}

	async openFile(file: DriveItemType, Router: Router): Promise<void> {
		Router.push({
			path: file.url,
			query: {
				type: 'preview'
			}
		});
	}
}

export { Data };
