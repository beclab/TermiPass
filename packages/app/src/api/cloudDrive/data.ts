import { Data as DriveDataAPI } from './../drive/data';

import { formatGd } from './filesFormat';
import { CommonFetch } from '../fetch';
import { DriveType, FileResType } from './../../stores/files';
import { fetchRepo } from './utils';
import { DriveMenuType } from './type';
import { getParams } from '../../utils/utils';

class Data extends DriveDataAPI {
	public commonAxios: any;

	constructor() {
		super();
		this.commonAxios = CommonFetch;
	}

	breadcrumbsBase = '/Drive';

	async fetch(url: string): Promise<FileResType> {
		let pureUrl = decodeURIComponent(url);

		const res: FileResType = await this.fetchData(pureUrl);

		if (res.isDir) {
			if (!pureUrl.endsWith('/')) pureUrl += '/';
			res.items = res.items.map((item, index) => {
				item.index = index;
				item.url = `${pureUrl}${encodeURIComponent(item.name)}`;
				if (item.isDir) {
					item.url += '/';
				}

				return item;
			});
		}

		return res;
	}

	async fetchData(url: string): Promise<FileResType> {
		const urls = url.slice(0, url.indexOf('?'));
		const urll = url.slice(url.indexOf('?'));

		const params = {
			path: getParams(urll, 'path'),
			name: getParams(urll, 'name'),
			drive: getParams(urll, 'drive')
		};
		const res = await this.commonAxios.post(urls, params);

		const data: FileResType = await formatGd(
			JSON.parse(JSON.stringify(res.data)),
			url
		);

		return data;
	}

	async fetchMenuRepo(): Promise<DriveMenuType[]> {
		const res1: any = await fetchRepo();
		const imgObj = {
			dropbox: './img/dropbox.svg',
			google: './img/google.svg'
		};

		const mineChildren: any[] = [];
		for (let i = 0; i < res1.length; i++) {
			const el = res1[i];

			mineChildren.push({
				label: el.name,
				key: el.name,
				icon: '',
				img: imgObj[el.type],
				defaultHide: true,
				driveType: DriveType.CloudDrive,
				...el
			});
		}

		return mineChildren;
	}

	async formatRepotoPath(item: any): Promise<string> {
		// const name =
		// 	item.key.indexOf('@') > -1
		// 		? item.key.slice(0, item.key.indexOf('@'))
		// 		: item.key;

		sessionStorage.setItem('currentActiveDrive', JSON.stringify(item));
		return `/Drive/${item.key}/`;
	}

	async formatPathtoUrl(path: string): Promise<string> {
		const currentActiveDrive = JSON.parse(
			sessionStorage.getItem('currentActiveDrive') || ''
		);

		const name = currentActiveDrive.name;
		const drive = currentActiveDrive.type;
		// const pureName =
		// 	name.indexOf('@') > -1 ? name.slice(0, name.indexOf('@')) : name;

		const p = path.slice(path.indexOf(name) + name.length);

		// p = p.startsWith('/') ? p.slice(1) : p;

		return `/drive/ls?name=${name}&drive=${drive}&path=${p}`;
	}
}

export { Data };
