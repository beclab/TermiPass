import { DriveDataAPI } from './../index';

import { removePrefix } from '../utils';
import { getAppDataPath } from '../../utils/file';
import { formatAppDataNode, formatAppData } from './filesFormat';
import { MenuItem } from './../../utils/contact';
import { OPERATE_ACTION } from './../../utils/contact';
import { files } from './../index';
import { CommonFetch } from '../fetch';
import { useFilesStore } from './../../stores/files';
import { useOperateinStore, CopyStoragesType } from 'src/stores/operation';

import { FileResType, DriveType } from './../../stores/files';
import { DriveMenuType } from './type';

class Data extends DriveDataAPI {
	public commonAxios: any;

	constructor() {
		super();
		this.commonAxios = CommonFetch;
	}

	async fetch(url: string): Promise<FileResType> {
		const pureUrl = decodeURIComponent(removePrefix(url));

		const res: FileResType = await this.fetchCache(pureUrl);
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

	async formatRepotoPath(): Promise<string> {
		return '/Files/AppData';
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
}

export { Data };
