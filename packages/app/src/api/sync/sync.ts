import { fetchURL } from '../utils';
// import { dataAPI } from './index';
import { dataAPIs } from '..';
import { useDataStore } from '../../stores/data';
import { axiosInstanceProxy } from '../../platform/httpProxy';

import { MenuItem } from './../../utils/contact';
import { SyncRepoItemType, SyncRepoSharedItemType } from './type';
import { useMenuStore } from 'src/stores/files-menu';

export async function instanceAxios(config) {
	const store = useDataStore();
	const baseURL = store.baseURL();
	const instance = axiosInstanceProxy({
		baseURL: baseURL,
		timeout: 10000
	});

	instance.interceptors.request.use(
		(config) => {
			if (config.headers) {
				config.headers['Access-Control-Allow-Origin'] = '*';
				config.headers['Access-Control-Allow-Headers'] =
					'X-Requested-With,Content-Type';
				config.headers['Access-Control-Allow-Methods'] =
					'PUT,POST,GET,DELETE,OPTIONS';
				return config;
			} else {
				return config;
			}
		},
		(error) => {
			return Promise.reject(error);
		}
	);

	return new Promise((resolve, reject) => {
		instance
			.request(config)
			.then((res) => {
				resolve(res);
			})
			.catch((e) => {
				reject(e);
			});
	});
}

export const getFormData = (object) =>
	Object.keys(object).reduce((formData, key) => {
		formData.append(key, object[key]);
		return formData;
	}, new FormData());

export async function createLibrary(name) {
	const parmas = {
		name: name,
		passwd: ''
	};
	const res = await instanceAxios({
		url: 'seahub/api2/repos/?from=web',
		method: 'post',
		data: getFormData(parmas),
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	});

	return res;
}

export async function fileOperate(
	path: string,
	url: string,
	parmas: { operation: string; newname?: string },
	floder: string
) {
	const menuStore = useMenuStore();
	const res = await instanceAxios({
		url: `seahub/${url}/${menuStore.activeMenu.id}/${floder}/?p=${path}`,
		method: 'post',
		data: getFormData(parmas),
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	});

	return res;
}

export async function updateFile(item, content, isNative = false) {
	const menuStore = useMenuStore();
	const pathLen =
		item.url.indexOf(menuStore.activeMenu.label) +
		menuStore.activeMenu.label.length;
	const parent_dir = item.url.slice(pathLen);
	const res = await fetchURL(
		`seahub/api2/repos/${menuStore.activeMenu.id}/update-link/?p=/`,
		{}
	);

	const params = {
		target_file: parent_dir,
		filename: item.name,
		files_content: content
	};

	const paramsT = {};
	if (isNative) {
		paramsT['reallyContentType'] = 'multipart/form-data';
	}

	const res3 = await instanceAxios({
		url:
			'/seahub/seafhttp/' + res.data.slice(res.data.indexOf('seafhttp/') + 9),
		method: 'post',
		data: getFormData(params),
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		params: paramsT
	});

	return res3;
}

export async function batchDeleteItem(data) {
	const res = await instanceAxios({
		url: 'seahub/api/v2.1/repos/batch-delete-item/',
		method: 'delete',
		data: data,
		headers: { 'Content-Type': 'application/json' }
	});

	return res;
}

export async function downloaFile(path) {
	console.log('downloaFile path', path);

	const store = useDataStore();
	const menuStore = useMenuStore();
	const currentItemLength = menuStore.activeMenu.label.length;
	const startIndex =
		path.indexOf(menuStore.activeMenu.label) + currentItemLength;
	const hasSeahub = path.slice(startIndex);

	console.log('hasSeahubhasSeahub', hasSeahub);

	const baseURL = store.baseURL();

	console.log(
		'1212--12',
		`${baseURL}/seahub/lib/${menuStore.activeMenu.id}/file/${hasSeahub}?dl=1`
	);

	return `${baseURL}/seahub/lib/${menuStore.activeMenu.id}/file/${hasSeahub}?dl=1`;
}

export async function batchMoveItem(data) {
	const res = await instanceAxios({
		url: 'seahub/api/v2.1/repos/sync-batch-move-item/',
		method: 'post',
		data: data,
		headers: { 'Content-Type': 'application/json' }
	});

	return res;
}

export async function reRepoName(url, data) {
	const res = await instanceAxios({
		url: url,
		method: 'post',
		data: getFormData(data),
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	});

	return res;
}

export async function deleteRepo(url) {
	const res = await instanceAxios({
		url: url,
		method: 'delete',
		headers: { 'Content-Type': 'application/json' }
	});

	return res;
}

export async function batchCopyItem(data) {
	const res = await instanceAxios({
		url: 'seahub/api/v2.1/repos/sync-batch-copy-item/',
		method: 'post',
		data: data,
		headers: { 'Content-Type': 'application/json' }
	});

	return res;
}

export const createThumbnail = async (path) => {
	const menuStore = useMenuStore();

	const res = await fetchURL(
		`/seahub/thumbnail/${menuStore.activeMenu.id}/create/?path=${path}&size=48`,
		{
			headers: { 'X-Requested-With': 'XMLHttpRequest' }
		}
	);
	return res;
};

export async function fetchRepo(
	menu: MenuItem
): Promise<SyncRepoItemType[] | SyncRepoSharedItemType[][] | undefined> {
	if (menu != MenuItem.SHAREDWITH && menu != MenuItem.MYLIBRARIES) {
		return undefined;
	}

	if (menu == MenuItem.MYLIBRARIES) {
		return fetchMineRepo();
	} else {
		const repos2 = await fetchtosharedRepo();
		const repos3 = await fetchsharedRepo();
		return [repos2, repos3];
	}
}

export async function fetchMineRepo(): Promise<SyncRepoItemType[]> {
	const dataAPI = dataAPIs();
	const res: any = await dataAPI.commonAxios.get(
		'/seahub/api/v2.1/repos/?type=mine',
		{}
	);

	const repos: SyncRepoItemType[] = res.repos;
	return repos;
}

export async function fetchtosharedRepo(): Promise<SyncRepoSharedItemType[]> {
	const dataAPI = dataAPIs();
	const res2: any = await dataAPI.commonAxios.get(
		'/seahub/api/v2.1/shared-repos/',
		{}
	);
	const repos2: SyncRepoSharedItemType[] = res2;

	return repos2;
}

export async function fetchsharedRepo(): Promise<SyncRepoSharedItemType[]> {
	const dataAPI = dataAPIs();
	const res3: any = await dataAPI.commonAxios.get(
		'/seahub/api/v2.1/repos/?type=shared',
		{}
	);
	const repos3: SyncRepoSharedItemType[] = res3.repos;

	return repos3;
}
