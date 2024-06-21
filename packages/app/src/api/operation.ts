import { Fetch } from './fetch';
import { checkSeahub, checkAppData } from '../utils/file';

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
}
