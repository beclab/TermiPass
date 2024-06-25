import { fetchURL } from './utils';
// import { dataAPI } from './index';
import { dataAPIsa } from './../api';
import { useSeahubStore } from '../stores/seahub';
import { useDataStore } from '../stores/data';
import { axiosInstanceProxy } from '../platform/httpProxy';

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

export async function getRepoId(id) {
	const seahubStore = useSeahubStore();

	const dataAPI = dataAPIsa();
	const res2 = await dataAPI.commonAxios.get(
		`seahub/api/v2.1/repos/${id}/`,
		{}
	);

	console.log('getRepoIdgetRepoId', res2);

	seahubStore.setRepoId({ id: res2.repo_id, name: res2.repo_name });
	// return res2.data;
}

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

export async function fileOperate(path, url, parmas, floder) {
	const seahubStore = useSeahubStore();
	const res = await instanceAxios({
		url: `seahub/${url}/${seahubStore.repo_id}/${floder}/?p=${path}`,
		method: 'post',
		data: getFormData(parmas),
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	});

	return res;
}

export async function updateFile(item, content, isNative = false) {
	const store = useDataStore();
	const seahubStore = useSeahubStore();
	let pathLen = item.url.indexOf(store.currentItem) + store.currentItem.length;
	const parent_dir = item.url.slice(pathLen);
	const res = await fetchURL(
		`seahub/api2/repos/${seahubStore.repo_id}/update-link/?p=/`,
		{}
	);

	const params = {
		target_file: parent_dir,
		filename: item.name,
		files_content: content
	};

	let paramsT = {};
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
	const store = useDataStore();
	const seahubStore = useSeahubStore();
	const currentItemLength = store.currentItem.length;
	const startIndex = path.indexOf(store.currentItem) + currentItemLength;
	const hasSeahub = path.slice(startIndex);

	const baseURL = store.baseURL();

	return `${baseURL}/seahub/lib/${seahubStore.repo_id}/file/${hasSeahub}?dl=1`;
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

export async function updateRepoName(repo_id, data) {
	const seahubStore = useSeahubStore();
	const res = await instanceAxios({
		url: `seahub/api2/repos/${seahubStore.repo_id}/?op=rename`,
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

export const formatFileContent = async (file) => {
	const store = useDataStore();
	const seahubStore = useSeahubStore();

	if (
		!['audio', 'video', 'text', 'txt', 'textImmutable', 'pdf'].includes(
			file.type
		)
	) {
		return file;
	}

	file.checkSeahub = true;
	const currentItemLength = store.currentItem.length;
	const startIndex = file.path.indexOf(store.currentItem) + currentItemLength;
	const hasSeahub = file.path.slice(startIndex);

	const res = await fetchURL(
		`/seahub/lib/${seahubStore.repo_id}/file${hasSeahub}?dict=1`,
		{}
	);

	if (['audio', 'video', 'pdf'].includes(file.type)) {
		file.url = store.baseURL() + res.data.raw_path; //res.data.raw_path
	} else if (['text', 'txt', 'textImmutable'].includes(file.type)) {
		file.content = res.data.file_content;
	}

	return file;
};

export const createThumbnail = async (path) => {
	const seahubStore = useSeahubStore();
	const res = await fetchURL(
		`/seahub/thumbnail/${seahubStore.repo_id}/create/?path=${path}&size=48`,
		{
			headers: { 'X-Requested-With': 'XMLHttpRequest' }
		}
	);
	return res;
};
