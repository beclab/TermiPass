import { Origin } from './../origin';
import { removePrefix, createURL } from '../utils';
import { formatDrive } from './filesFormat';
import { MenuItem } from './../../utils/contact';
import { OPERATE_ACTION } from './../../utils/contact';
import { files } from './../index';
import { useSeahubStore } from '../../stores/seahub';
import { notifyWaitingShow, notifyHide } from '../../utils/notifyRedefinedUtil';

import { checkSameName } from './../../utils/file';
import url from '../../utils/url';
import { CommonFetch } from '../fetch';
import { useFilesStore } from './../../stores/files';
import { useOperateinStore, CopyStoragesType } from 'src/stores/operation';

import {
	FileItem,
	FileResType,
	DriveType,
	FilePath
} from './../../stores/files';
import { DriveMenuType } from './type';

class Data extends Origin {
	public commonAxios: any;

	constructor() {
		super();
		this.commonAxios = CommonFetch;
	}

	async fetch(url: string): Promise<FileResType> {
		console.log('urlrrr', url);
		const pureUrl = decodeURIComponent(removePrefix(url));
		console.log('pureUrlpureUrl', pureUrl);

		const res: FileResType = await this.fetchDrive(pureUrl);
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

	async fetchDrive(url: string): Promise<FileResType> {
		const res = await this.commonAxios.get(
			`/api/resources${encodeURIComponent(url)}`,
			{}
		);

		const data: FileResType = await formatDrive(
			JSON.parse(JSON.stringify(res))
		);

		return data;
	}

	async fetchMenuRepo(): Promise<DriveMenuType[]> {
		return [
			{
				label: MenuItem.HOME,
				key: MenuItem.HOME,
				icon: 'sym_r_other_houses',
				driveType: DriveType.Drive
			},
			{
				label: MenuItem.DOCUMENTS,
				key: MenuItem.DOCUMENTS,
				icon: 'sym_r_news',
				driveType: DriveType.Drive
			},
			{
				label: MenuItem.PICTURES,
				key: MenuItem.PICTURES,
				icon: 'sym_r_art_track',
				driveType: DriveType.Drive
			},
			{
				label: MenuItem.MOVIES,
				key: MenuItem.MOVIES,
				icon: 'sym_r_smart_display',
				driveType: DriveType.Drive
			},
			{
				label: MenuItem.DOWNLOADS,
				key: MenuItem.DOWNLOADS,
				icon: 'sym_r_browser_updated',
				driveType: DriveType.Drive
			}
		];
	}

	async download(path: string): Promise<{ url: string; headers: any }> {
		const filesStore = useFilesStore();

		if (
			filesStore.selectedCount === 1 &&
			!filesStore.currentFileList[filesStore.selected[0]].isDir
		) {
			const { url, node } = await files.download(
				null,
				filesStore.currentFileList[filesStore.selected[0]].url
			);

			const headers = {
				'Content-Type': 'application/octet-stream'
			};
			if (node) {
				headers['X-Terminus-Node'] = node;
			}

			return { url, headers };
		}

		const filesDownload: any[] = [];

		if (filesStore.selectedCount > 0) {
			for (const i of filesStore.selected) {
				filesDownload.push(filesStore.currentFileList[i].url);
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

	async downloadFile(fileUrl: any, filename = ''): Promise<void> {
		const a = document.createElement('a');
		a.style.display = 'none';
		a.href = fileUrl.url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}

	async copy(): Promise<CopyStoragesType[]> {
		const filesStore = useFilesStore();
		const copyStorages: CopyStoragesType[] = [];
		for (const item of filesStore.selected) {
			const el = filesStore.currentFileList[item];
			const from = decodeURIComponent(el.url).slice(6);
			copyStorages.push({
				from: from,
				to: '',
				name: el.name,
				src_drive_type: DriveType.Drive
			});
		}

		console.log('copyStorages', copyStorages);

		return copyStorages;
	}

	async cut(): Promise<CopyStoragesType[]> {
		const filesStore = useFilesStore();

		const copyStorages: CopyStoragesType[] = [];
		for (const item of filesStore.selected) {
			const el = filesStore.currentFileList[item];
			const from = decodeURIComponent(el.url).slice(6);
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
			let lastPathIndex =
				path.indexOf('?') > -1
					? decodeURIComponent(path).slice(6, path.indexOf('?'))
					: decodeURIComponent(path).slice(6);

			lastPathIndex = lastPathIndex.endsWith('/')
				? lastPathIndex
				: lastPathIndex + '/';

			const to = lastPathIndex + decodeURIComponent(element.name);
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

			const from = decodeURIComponent(element.url).slice(6);
			const to = decodeURIComponent(path + '/' + element.name).slice(6);
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

	async fetchUploader(
		url: string,
		content: any,
		overwrite = false,
		timer = this.RETRY_TIMER,
		callback?: (event?: any) => void
	): Promise<void> {
		const newurl = removePrefix(decodeURIComponent(url));

		const appNode = '';

		const fileInfo: any = await files.getUploadInfo(newurl, '/data', content);

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

	async openPreview(item: any): Promise<FileResType> {
		const res = await this.fetch(item.path);
		console.log('resres', res);
		res.driveType = DriveType.Drive;
		return res;
	}

	getPreviewURL(file: any, thumb: string): string {
		const params = {
			inline: 'true',
			key: file.modified
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

	async formatFileContent(file: FileItem): Promise<FileItem> {
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

				file.content = res.data.content;
			} catch (error) {
				console.error(error.message);
			}
		}
		return file;
	}

	async formatRepotoPath(item: any): Promise<string> {
		return (
			'/Files/Home/' +
			(item.label && item.label != MenuItem.HOME ? item.label + '/' : '')
		);
	}

	async formatPathtoUrl(item: FilePath): Promise<string> {
		return item.path;
	}

	async deleteItem(items: FileItem[]): Promise<void> {
		// const filesStore = useFilesStore();

		const promises: any = [];

		for (let i = 0; i < items.length; i++) {
			const item = items[i];
			promises.push(files.remove(item.path));
		}

		await Promise.all(promises);
	}

	async renameItem(item: FileItem, newName: string): Promise<void> {
		const oldLink = decodeURIComponent(item.path);
		const newLink =
			url.removeLastDir(oldLink) + '/' + encodeURIComponent(newName);

		await files.rename(oldLink, newLink);
	}

	async createDir(dirName: string, path: string): Promise<void> {
		const filesStore = useFilesStore();
		const newName = await checkSameName(dirName, filesStore.currentFileList);

		let url = path + '/' + encodeURIComponent(newName) + '/';
		url = url.replace('//', '/');

		await files.resourceAction(url, 'post');
	}
}

export { Data };
