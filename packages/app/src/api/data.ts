import { Fetch } from './fetch';
import { removePrefix } from './utils';
import {
	checkOrigin,
	OriginType,
	DriveResType,
	SyncRepoItemType,
	SyncRepoSharedItemType
} from './common/encoding';
import { getAppDataPath, isAppData } from '../utils/file';
import { formatSeahub } from '../utils/seahub';
import { formatAppDataNode } from '../utils/appdata';

import { useSeahubStore } from '../stores/seahub';
import { MenuItem } from '../utils/contact';

export class Data extends Fetch {
	public baseURL: string;

	constructor() {
		super();
	}

	async fetch(
		url: string,
		loading?: boolean,
		curItem?: string
	): Promise<DriveResType> {
		url = decodeURIComponent(removePrefix(url));

		console.log('loading', loading);
		console.log('curItem', curItem);

		let res: DriveResType;

		switch (checkOrigin(url)) {
			case OriginType.DRIVE:
				res = await this.fetchDrive(url);
				break;

			case OriginType.SYNC:
				res = await this.fetchSync(url);
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

	async fetchDrive(url: string): Promise<DriveResType> {
		let res: DriveResType;
		res = await this.get(`/api/resources${url}`, {});

		if (isAppData(url)) {
			res = formatAppDataNode(url, JSON.parse(JSON.stringify(res)));
		}
		return res;
	}

	async fetchSync(url: string): Promise<DriveResType> {
		const seahubStore = useSeahubStore();
		const currentItem = seahubStore.repo_name;
		const pathLen = url.indexOf(currentItem) + currentItem.length;
		const path = url.slice(pathLen);
		const res = await this.get(
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

	async fetchCache(url: string): Promise<DriveResType> {
		const { path, node } = getAppDataPath(url);
		const res: DriveResType = await this.get(
			`/api/resources/AppData${path}`,
			{},
			{ auth: true, node }
		);

		return res;
	}

	async fetchSyncRepo(menu: string): Promise<any> {
		if (menu != MenuItem.SHAREDWITH && menu != MenuItem.MYLIBRARIES) {
			return undefined;
		}

		if (menu == MenuItem.MYLIBRARIES) {
			const res: any = await this.get('/seahub/api/v2.1/repos/?type=mine', {});

			const repos: SyncRepoItemType[] = res.repos;
			return repos;
		} else {
			const res2: any = await this.get('/seahub/api/v2.1/shared-repos/', {});
			const res3: any = await this.get(
				'/seahub/api/v2.1/repos/?type=shared',
				{}
			);

			const repos2: SyncRepoSharedItemType[] = res2;
			const repos3: SyncRepoSharedItemType[] = res3.repos;

			return [repos2, repos3];
		}
	}
}
