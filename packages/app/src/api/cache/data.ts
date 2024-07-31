import { Data as DriveDataAPI } from './../drive/data';

import { removePrefix } from '../utils';
import { getAppDataPath } from '../../utils/file';
import { formatAppDataNode, formatAppData } from './filesFormat';
import { MenuItem } from './../../utils/contact';
import { OPERATE_ACTION } from './../../utils/contact';
// import { files } from './../index';
import { CommonFetch } from '../fetch';
import { useFilesStore } from './../../stores/files';
import { useOperateinStore, CopyStoragesType } from 'src/stores/operation';

import { FileResType, DriveType } from './../../stores/files';
import { DriveMenuType } from './type';
import { useDataStore } from 'src/stores/data';

class Data extends DriveDataAPI {
	public commonAxios: any;

	constructor() {
		super();
		this.commonAxios = CommonFetch;
	}

	breadcrumbsBase = '/Cache';

	async fetch(url: string): Promise<FileResType> {
		console.log('urlurl', url);
		const pureUrl = decodeURIComponent(url);
		console.log('pureUrlpureUrlpureUrl', pureUrl);

		const res: FileResType = await this.fetchCache(pureUrl);
		console.log('cache res', res);

		res.url = `/Files${pureUrl}`;

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

	async fetchCache(url: string): Promise<FileResType> {
		console.log('fetchCachefetchCache', url);
		const { path, node } = getAppDataPath(url);
		let headers = {
			auth: false,
			'X-Terminus-Node': ''
		};
		if (node) {
			headers = {
				auth: true,
				'X-Terminus-Node': node
			};
		}
		const options = headers.auth ? { headers: headers } : {};

		const res: any = await this.commonAxios.get(
			`/api/resources/AppData${path}`,
			options
		);

		let data: FileResType;
		if (res.data) {
			data = formatAppDataNode(url, JSON.parse(JSON.stringify(res)));
		} else {
			data = formatAppData(node, JSON.parse(JSON.stringify(res)));
		}

		return data;
	}

	async fetchMenuRepo(): Promise<DriveMenuType[]> {
		return [
			{
				label: MenuItem.CACHE,
				key: MenuItem.CACHE,
				icon: 'sym_r_analytics',
				driveType: DriveType.Cache
			}
		];
	}

	async formatRepotoPath(item: any): Promise<string> {
		console.log('formatRepotoPath - itemitem', item);

		if (item.label === 'Cache') return '/Cache/';
		// if (item.label === 'Cache') return '/CacheList';
		return '/Cache/' + item.label;
	}

	async formatPathtoUrl(path: string): Promise<string> {
		console.log('formatPathtoUrl - itemitem', path);

		if (path.endsWith('/Cache/')) {
			return '/AppData';
		}

		const purePath = path.replace('/Cache', '/AppData');
		console.log('purePath', purePath);

		return purePath;
	}

	async copy(): Promise<CopyStoragesType[]> {
		const filesStore = useFilesStore();
		const copyStorages: CopyStoragesType[] = [];
		for (const item of filesStore.selected) {
			const el = filesStore.currentFileList[item];
			const from = decodeURIComponent(el.path);
			copyStorages.push({
				from: from,
				to: '',
				name: el.name,
				src_drive_type: DriveType.Cache
			});
		}

		return copyStorages;
	}

	async cut(): Promise<CopyStoragesType[]> {
		const filesStore = useFilesStore();

		const copyStorages: CopyStoragesType[] = [];
		for (const item of filesStore.selected) {
			const el = filesStore.currentFileList[item];
			const from = decodeURIComponent(el.path);
			copyStorages.push({
				from: from,
				to: '',
				name: el.name,
				src_drive_type: DriveType.Cache,
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
		const items: CopyStoragesType[] = [];

		const modifiedPath = path.endsWith('/') ? path : path + '/';

		for (let i = 0; i < operateinStore.copyFiles.length; i++) {
			const element: any = operateinStore.copyFiles[i];

			const to =
				decodeURIComponent(modifiedPath) + decodeURIComponent(element.name);

			items.push({
				from: element.from,
				to: to,
				name: element.name,
				src_drive_type: element.src_drive_type,
				dst_drive_type: DriveType.Cache
			});
			if (path + decodeURIComponent(element.name) === element.from) {
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
		const filesStore = useFilesStore();
		const items: CopyStoragesType[] = [];
		for (const i of filesStore.selected) {
			const element: any = filesStore.currentFileList[i];

			const from = decodeURIComponent(element.path);
			const to = decodeURIComponent(path + element.name);
			items.push({
				from: from,
				to: to,
				name: element.name,
				src_drive_type: element.driveType,
				dst_drive_type: DriveType.Cache
			});
		}
		const overwrite = true;
		this.action(overwrite, true, items, path, true, callback);
	}

	async download(path: string): Promise<{ url: string; headers: any }> {
		const filesStore = useFilesStore();
		const store = useDataStore();
		const baseURL = store.baseURL();

		const nodes = path.split('/')[2];
		console.log('nodes', nodes);
		const p = path.slice(path.indexOf(nodes) + nodes.length);
		console.log('pppp', p);

		if (
			filesStore.selectedCount === 1 &&
			!filesStore.currentFileList[filesStore.selected[0]].isDir
		) {
			const name = filesStore.currentFileList[filesStore.selected[0]].name;

			const url = `${baseURL}/api/cache/${nodes}/raw/AppData${p}/${name}`;

			console.log('urlurlurl', url);

			return { url, headers: {} };
		}

		const filesDownload: any[] = [];

		if (filesStore.selectedCount > 0) {
			for (const i of filesStore.selected) {
				filesDownload.push(filesStore.currentFileList[i].url);
			}
		} else {
			filesDownload.push(path);
		}

		console.log('filesDownload', filesDownload);

		// const { url, node } = files.download('zip', ...filesDownload);

		let arg = '';
		let zipUrl = '';
		// let node = '';
		for (const file of filesDownload) {
			arg += removePrefix(file) + ',';
		}

		arg = arg.substring(0, arg.length - 1);
		// arg = encodeURIComponent(arg);
		// zipUrl += `/?files=${arg}&`;
		// zipUrl += `algo=zip&`;

		console.log('zipUrlzipUrl', zipUrl);

		const rPath = zipUrl.slice(zipUrl.indexOf(nodes) + nodes.length);

		zipUrl = `${baseURL}/api/cache/${nodes}/raw/AppData${rPath}`;
		const headers = {
			'Content-Type': 'application/octet-stream'
		};
		// if (node) {
		// 	headers['X-Terminus-Node'] = node;
		// }

		return { url: zipUrl, headers };
	}
}

export { Data };
