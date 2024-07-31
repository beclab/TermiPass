import { DriveDataAPI, files } from './../index';
// import { removePrefix } from '../utils';
import { MenuItem } from './../../utils/contact';
import { formatData } from './filesFormat';
import { FileResType, DriveType } from './../../stores/files';
import { DriveMenuType } from './type';

class Data extends DriveDataAPI {
	breadcrumbsBase = '/Data';

	async fetch(url: string): Promise<FileResType> {
		console.log('urlurlurl', url);
		// const pureUrl = decodeURIComponent(removePrefix(url));
		const pureUrl = decodeURIComponent(url).replace('/Data', '/Application');
		console.log('pureUrlpureUrl', pureUrl);

		const res: FileResType = await this.fetchData(pureUrl);

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

	async fetchData(url: string): Promise<FileResType> {
		const res = await this.commonAxios.get(
			`/api/resources${encodeURIComponent(url)}`,
			{}
		);

		const data: FileResType = await formatData(JSON.parse(JSON.stringify(res)));

		return data;
	}

	async fetchMenuRepo(): Promise<DriveMenuType[]> {
		return [
			{
				label: MenuItem.DATA,
				key: MenuItem.DATA,
				icon: 'sym_r_database',
				driveType: DriveType.Data
			}
		];
	}

	async formatRepotoPath(item: any): Promise<string> {
		console.log('formatRepotoPath - itemitem', item);
		if (item.label === 'Data') return '/Data/';
		return '/Data/' + item.label;
	}

	async formatPathtoUrl(path: string): Promise<string> {
		if (path.endsWith('/Data/')) {
			return '/Application';
		}

		const purePath = path.replace('/Data', '/Application');
		console.log('purePath', purePath);
		return purePath;
	}

	async fetchUploader(
		url: string,
		content: any,
		overwrite = false,
		timer = this.RETRY_TIMER,
		callback?: (event?: any) => void
	): Promise<void> {
		let newurl = decodeURIComponent(url);
		console.log('fetchUploader --->>');

		const appNode = '';

		// Temporary code
		newurl = newurl.replace('/Data', '/Application');

		console.log('pathpathpath', newurl);

		const fileInfo: any = await files.getUploadInfo(newurl, '/data', content);

		console.log('fileInfofileInfo', fileInfo);
		console.log('contentcontent', content);

		const fileChunkList = await files.createFileChunk(fileInfo, content);

		console.log('fileChunkList', fileChunkList);

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
