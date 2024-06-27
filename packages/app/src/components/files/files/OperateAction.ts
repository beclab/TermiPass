import { checkSeahub, checkAppData } from '../../../utils/file';
import { useDataStore } from '../../../stores/data';
import { files as api, seahub } from '../../../api/index';
import * as upload from '../../../utils/upload';
import { RouteLocationNormalizedLoaded } from 'vue-router';
import { useSeahubStore } from 'src/stores/seahub';
import { OPERATE_ACTION } from '../../../utils/contact';
import {
	notifyWaitingShow,
	notifyHide
} from '../../../utils/notifyRedefinedUtil';
// import { removePrefix } from '../../../api/utils';

export interface CopyItemType {
	dst_parent_dir: string;
	dst_repo_id: string;
	src_dirents: string[];
	src_parent_dir: string;
	src_repo_id: string;
}

export const handleRepoOperate = (e: any, action: OPERATE_ACTION) => {
	e.preventDefault();
	e.stopPropagation();

	const dataStore = useDataStore();

	switch (action) {
		case OPERATE_ACTION.DELETE:
			dataStore.showHover('delete');
			break;

		case OPERATE_ACTION.SHARE:
			// menuStore.showShareUser = true;
			// menuStore.shareRepoInfo = props.item;
			break;
		case OPERATE_ACTION.RENAME:
			dataStore.showHover('rename');
			break;
		case OPERATE_ACTION.ATTRIBUTES:
			dataStore.showHover('info');
			break;
		default:
			break;
	}
};

export const handleFileOperate = (
	e: any,
	route: RouteLocationNormalizedLoaded,
	action: OPERATE_ACTION,
	callback: (action: OPERATE_ACTION, data: any) => Promise<void>
) => {
	e.preventDefault();
	e.stopPropagation();

	const dataStore = useDataStore();

	switch (action) {
		case OPERATE_ACTION.CREATE_FOLDER:
			dataStore.showHover('newDir');
			break;

		case OPERATE_ACTION.CREATE_REPO:
			dataStore.showHover('NewLib');
			break;

		case OPERATE_ACTION.DOWNLOAD:
			_download(route.path, callback);
			break;

		case OPERATE_ACTION.UPLOAD_FILES:
			_uploadFiles();
			break;

		case OPERATE_ACTION.UPLOAD_FOLDER:
			_uploadFolder();
			break;

		case OPERATE_ACTION.ATTRIBUTES:
			dataStore.showHover('info');
			break;

		case OPERATE_ACTION.COPY:
			_copyCatalogue();
			callback(OPERATE_ACTION.COPY, callback);
			break;

		case OPERATE_ACTION.CUT:
			_cutCatalogue();
			callback(OPERATE_ACTION.CUT, null);
			break;

		case OPERATE_ACTION.PASTE:
			_pasteCatalogue(route, callback);
			break;

		case OPERATE_ACTION.MOVE:
			_moveCatalogue(route.path, callback);
			break;

		case OPERATE_ACTION.RENAME:
			dataStore.showHover('rename');
			break;

		case OPERATE_ACTION.DELETE:
			dataStore.showHover('delete');
			break;

		case OPERATE_ACTION.REFRESH:
			dataStore.setReload(true);
			break;

		case OPERATE_ACTION.SHARE:
			dataStore.showHover('share-dialog');
			break;

		case OPERATE_ACTION.SYNCHRONIZE_TO_LOCAL:
			break;

		case OPERATE_ACTION.OPEN_LOCAL_SYNC_FOLDER:
			callback(OPERATE_ACTION.OPEN_LOCAL_SYNC_FOLDER, openLocalFolder());

			break;

		default:
			break;
	}
	// dataStore.resetMutilSelected();
};

const openLocalFolder = () => {
	const dataStore = useDataStore();
	const seahubStore = useSeahubStore();
	const item = dataStore.req.items[dataStore.selected[0]];
	if (!item.isDir) {
		return undefined;
	}
	const itemUrl = decodeURIComponent(item.url);
	const pathFromStart =
		itemUrl.indexOf(seahubStore.repo_name) + seahubStore.repo_name.length;
	const path = itemUrl.slice(pathFromStart, itemUrl.length - 1);
	return path;
};

const _download = async (
	path: string,
	callback: (action: OPERATE_ACTION, data: any) => Promise<void>
) => {
	const dataStore = useDataStore();

	if (
		dataStore.selectedCount === 1 &&
		!dataStore.req.items[dataStore.selected[0]].isDir
	) {
		if (checkSeahub(dataStore.req.items[dataStore.selected[0]].path)) {
			const url = await seahub.downloaFile(
				dataStore.req.items[dataStore.selected[0]].path
			);
			await callback(OPERATE_ACTION.DOWNLOAD, { url: url, headers: {} });
			return false;
		}

		const { url, node } = api.download(
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

		await callback(OPERATE_ACTION.DOWNLOAD, { url, headers });
		return false;
	}

	const files: any[] = [];

	if (dataStore.selectedCount > 0) {
		for (const i of dataStore.selected) {
			files.push(dataStore.req.items[i].url);
		}
	} else {
		files.push(path);
	}

	const { url, node } = api.download('zip', ...files);

	const headers = {
		...dataStore.req.headers,
		'Content-Type': 'application/octet-stream'
	};
	if (node) {
		headers['X-Terminus-Node'] = node;
	}

	await callback(OPERATE_ACTION.DOWNLOAD, { url, headers });
};

const _uploadFiles = () => {
	const query = getParams(window.location.href, 'id');
	let element: any = null;
	if (query) {
		element = document.getElementById('uploader-input');
	} else {
		element = document.getElementById('upload-input');
	}

	element.value = '';
	element.removeAttribute('webkitdirectory');
	element.click();
};

const _uploadFolder = () => {
	const query = getParams(window.location.href, 'id');
	let element: any = null;
	if (query) {
		element = document.getElementById('uploader-input');
	} else {
		element = document.getElementById('upload-folder-input');
	}
	element.value = '';
	element.setAttribute('webkitdirectory', 'webkitdirectory');
	element.click();
};

const getParams = (url: string, params: string) => {
	const res = new RegExp('(?:&|/?)' + params + '=([^&$]+)').exec(url);
	return res ? res[1] : '';
};

const _copyCatalogue = () => {
	const dataStore = useDataStore();
	const seahubStore = useSeahubStore();

	const items: {
		from: any;
		to: string;
		name: any;
		src_repo_id?: any;
		parentPath: string;
	}[] = [];

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

		items.push({
			from: from,
			to: '',
			name: el.name,
			src_repo_id: seahubStore.repo_id || undefined,
			parentPath: el.parentPath
		});
	}

	const isSeahub = checkSeahub(dataStore.req.url);
	dataStore.updateCopyFiles(items, isSeahub ? 'Sync' : 'Drive');
};

const _cutCatalogue = () => {
	const dataStore = useDataStore();
	const items: {
		from: any;
		to: string;
		name: any;
		src_repo_id?: any;
		key?: string;
		parentPath: string;
	}[] = [];

	const query = getParams(window.location.search, 'id');

	for (const item of dataStore.selected) {
		items.push({
			from: dataStore.req.items[item].url,
			to: '',
			name: dataStore.req.items[item].name,
			src_repo_id: query || undefined,
			parentPath: dataStore.req.items[item].parentPath,
			key: 'x'
		});
	}

	const isSeahub = checkSeahub(dataStore.req.url);
	dataStore.updateCopyFiles(items, isSeahub ? 'Sync' : 'Drive');
};

const _pasteCatalogue = async (
	route: RouteLocationNormalizedLoaded,
	callback: (action: OPERATE_ACTION, data: any) => Promise<void>
) => {
	const dataStore = useDataStore();
	const seahubStore = useSeahubStore();

	const items: {
		from: any;
		to: string;
		name: any;
		src_repo_id?: any;
		parentPath: string;
	}[] = [];
	for (let i = 0; i < dataStore.copyFiles.length; i++) {
		const element: any = dataStore.copyFiles[i];

		let to =
			decodeURIComponent(route.path).slice(6) +
			decodeURIComponent(element.name);

		if (checkSeahub(route.path)) {
			const pathFromStart =
				decodeURIComponent(route.path).indexOf(seahubStore.repo_name) +
				seahubStore.repo_name.length;
			to =
				'/' +
				(seahubStore.repo_id || '') +
				decodeURIComponent(route.path).slice(pathFromStart) +
				decodeURIComponent(element.name);
		}

		if (checkAppData(route.path)) {
			to = decodeURIComponent(route.path) + decodeURIComponent(element.name);
		}

		items.push({
			from: element.from,
			to: to,
			name: element.name,
			src_repo_id: element.src_repo_id || undefined,
			parentPath: element.parentPath
		});

		if (route.path + decodeURIComponent(element.name) === element.from) {
			action(false, true, items, route.path, false, callback);
			// dataStore.resetCopyFiles();
			return;
		}
	}

	const dstItems = (await api.fetch(route.path)).items;
	const conflict = upload.checkConflict(items, dstItems);

	let overwrite = false;
	let rename = true;
	let isMove = false;

	if (dataStore.copyFiles[0].key === 'x') {
		overwrite = true;
		isMove = true;
	}

	if (conflict) {
		rename = true;
	}

	action(overwrite, rename, items, route.path, isMove, callback);
};

const _moveCatalogue = async (
	path: string,
	callback: (action: OPERATE_ACTION, data: any) => Promise<void>
) => {
	const dataStore = useDataStore();
	const seahubStore = useSeahubStore();
	const items: {
		from: any;
		to: string;
		name: any;
		src_repo_id?: any;
		parentPath: string;
	}[] = [];

	for (const i of dataStore.selected) {
		const element: any = dataStore.req.items[i];
		let from = decodeURIComponent(element.url).slice(6);
		let to = decodeURIComponent(path + element.name).slice(6);

		if (checkSeahub(element.url)) {
			const fromStart =
				decodeURIComponent(element.url).indexOf(seahubStore.repo_name) +
				seahubStore.repo_name.length;

			const formEnd = decodeURIComponent(element.url).indexOf(element.name);

			from =
				'/' +
				seahubStore.repo_id +
				decodeURIComponent(element.url).slice(fromStart, formEnd) +
				element.name;

			const toStart =
				decodeURIComponent(path).indexOf(seahubStore.repo_name) +
				seahubStore.repo_name.length;

			to =
				'/' +
				seahubStore.repo_id +
				decodeURIComponent(path).slice(toStart) +
				element.name;
		}

		if (checkAppData(element.url)) {
			from = decodeURIComponent(element.url);
			to = decodeURIComponent(path + element.name);
		}

		items.push({
			from: from,
			to: to,
			name: element.name,
			src_repo_id: seahubStore.repo_id,
			parentPath: element.parentPath
		});
	}

	const overwrite = true;

	action(overwrite, true, items, path, true, callback);
};

const action = async (
	overwrite: boolean | undefined,
	rename: boolean | undefined,
	items: {
		from: any;
		to: string;
		name: any;
		src_repo_id?: any;
		parentPath: string;
	}[],
	path: string,
	isMove: boolean | undefined,
	callback: (action: OPERATE_ACTION, data: any) => Promise<void>
) => {
	const dataStore = useDataStore();
	const dest = path;

	notifyWaitingShow('Pasting, Please wait...');

	if (isMove) {
		await api
			.move(items, overwrite, rename)
			.then(() => {
				callback(OPERATE_ACTION.MOVE, dest);
				notifyHide();
				dataStore.setReload(true);
			})
			.catch(() => {
				notifyHide();
			});
	} else {
		await api
			.copy(items, overwrite, rename)
			.then(() => {
				callback(OPERATE_ACTION.PASTE, dest);
				notifyHide();
				dataStore.setReload(true);
			})
			.catch(() => {
				notifyHide();
			});
	}
};
