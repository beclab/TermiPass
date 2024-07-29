import { DriveDataAPI } from './../index';
// import { removePrefix } from '../utils';
import { MenuItem } from './../../utils/contact';
import { formatData } from './filesFormat';

import { FileResType, DriveType, FilePath } from './../../stores/files';
import { DriveMenuType } from './type';

class Data extends DriveDataAPI {
	async fetch(url: string): Promise<FileResType> {
		console.log('urlurlurl', url);
		// const pureUrl = decodeURIComponent(removePrefix(url));
		const pureUrl = decodeURIComponent(url);
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

	async formatPathtoUrl(item: FilePath): Promise<string> {
		if (item.path.endsWith('/Data/')) {
			return '/Application';
		}

		const purePath = item.path.replace('/Data', '/Application');
		console.log('purePath', purePath);
		return purePath;
	}
}

export { Data };
