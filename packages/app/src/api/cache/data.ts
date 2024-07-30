import { Data as DriveDataAPI } from './../drive/data';

import { removePrefix } from '../utils';
import { getAppDataPath } from '../../utils/file';
import { formatAppDataNode, formatAppData } from './filesFormat';
import { MenuItem } from './../../utils/contact';
import { OPERATE_ACTION } from './../../utils/contact';
import { files } from './../index';
import { CommonFetch } from '../fetch';
import { useFilesStore } from './../../stores/files';
import { useOperateinStore, CopyStoragesType } from 'src/stores/operation';

import { FileResType, DriveType, FilePath } from './../../stores/files';
import { DriveMenuType } from './type';

class Data extends DriveDataAPI {
	public commonAxios: any;

	constructor() {
		super();
		this.commonAxios = CommonFetch;
	}

	async fetch(url: string): Promise<FileResType> {
		console.log('urlurl', url);
		const pureUrl = decodeURIComponent(url);
		console.log('pureUrlpureUrlpureUrl', pureUrl);

		const res: FileResType = await this.fetchCache(pureUrl);
		console.log('res', res);

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

	// async formatRepotoPath(item: any): Promise<string> {
	// 	console.log('formatRepotoPath - itemitem', item);
	// 	if (item.label === 'Data') return '/Data/';
	// 	return '/Data/' + item.label;
	// }

	// async formatPathtoUrl(item: FilePath): Promise<string> {
	// 	if (item.path.endsWith('/Data/')) {
	// 		return '/Application';
	// 	}

	// 	const purePath = item.path.replace('/Data', '/Application');
	// 	console.log('purePath', purePath);
	// 	return purePath;
	// }

	async formatRepotoPath(item: any): Promise<string> {
		console.log('formatRepotoPath - itemitem', item);

		if (item.label === 'Cache') return '/Cache/';
		return '/Cache/' + item.label;
	}

	async formatPathtoUrl(item: FilePath): Promise<string> {
		console.log('formatPathtoUrl - itemitem', item);

		if (item.path.endsWith('/Cache/')) {
			return '/AppData';
		}

		const purePath = item.path.replace('/Cache', '/AppData');
		console.log('purePath', purePath);

		// const hasAli = purePath.indexOf('ali-');
		// if (hasAli > -1) {
		// 	purePath = purePath.replace(/\/?ali-[^\/]*\//, '/');
		// }

		console.log('purePath', purePath);

		return purePath;
	}

	async copy(): Promise<CopyStoragesType[]> {
		const filesStore = useFilesStore();
		const copyStorages: CopyStoragesType[] = [];
		for (const item of filesStore.selected) {
			const el = filesStore.currentFileList[item];
			const from = decodeURIComponent(el.url);
			copyStorages.push({
				from: from,
				to: '',
				name: el.name,
				src_drive_type: DriveType.Drive
			});
		}

		return copyStorages;
	}

	async cut(): Promise<CopyStoragesType[]> {
		const filesStore = useFilesStore();

		const copyStorages: CopyStoragesType[] = [];
		for (const item of filesStore.selected) {
			const el = filesStore.currentFileList[item];
			const from = decodeURIComponent(el.url);
			copyStorages.push({
				from: from,
				to: '',
				name: el.name,
				src_drive_type: DriveType.Drive,
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

		for (let i = 0; i < operateinStore.copyFiles.length; i++) {
			const element: any = operateinStore.copyFiles[i];

			const to = decodeURIComponent(path) + decodeURIComponent(element.name);
			items.push({
				from: element.from,
				to: to,
				name: element.name,
				src_drive_type: element.src_drive_type,
				dst_drive_type: DriveType.Drive
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

			const from = decodeURIComponent(element.url);
			const to = decodeURIComponent(path + element.name);
			items.push({
				from: from,
				to: to,
				name: element.name,
				src_drive_type: element.driveType,
				dst_drive_type: DriveType.Drive
			});
		}
		const overwrite = true;
		this.action(overwrite, true, items, path, true, callback);
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

		const { path, node } = getAppDataPath(newurl);
		appNode = node;
		if (node) {
			fileInfo = await files.getUploadInfo(path, `/appdata`, content);
		}

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

	async download(path: string): Promise<{ url: string; headers: any }> {
		const filesStore = useFilesStore();

		console.log('download path', path);
		console.log('currentFileList', filesStore.currentFileList);
		console.log('selected', filesStore.selected);

		const nodes = path.split('/')[2];
		console.log('nodes', nodes);
		const p = path.slice(path.indexOf(nodes) + nodes.length);

		if (
			filesStore.selectedCount === 1 &&
			!filesStore.currentFileList[filesStore.selected[0]].isDir
		) {
			// const { url, node } = await files.download(
			// 	null,
			// 	filesStore.currentFileList[filesStore.selected[0]].url
			// );

			// const headers = {
			// 	'Content-Type': 'application/octet-stream'
			// };
			// if (node) {
			// 	headers['X-Terminus-Node'] = node;
			// }

			// return { url, headers };

			// /api/cache/{{nodename}}/raw/AppData

			const url = `/api/cache/${nodes}/raw/AppData/${p}`;

			return { url, headers: {} };
		}

		const filesDownload: any[] = [];

		if (filesStore.selectedCount > 0) {
			alert(1);
			for (const i of filesStore.selected) {
				filesDownload.push(filesStore.currentFileList[i].url);
			}
		} else {
			alert(2);
			filesDownload.push(path);
		}

		console.log('filesDownload', filesDownload);

		const { url, node } = files.download('zip', ...filesDownload);

		const headers = {
			'Content-Type': 'application/octet-stream'
		};
		if (node) {
			headers['X-Terminus-Node'] = node;
		}

		return { url, headers };
	}
}

export { Data };
