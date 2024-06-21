import { createURL, fetchURL, removePrefix } from './utils';
import { useDataStore } from '../stores/data';
import { formatSeahub, formatSeahubRepos } from '../utils/seahub';
import {
	checkSeahub,
	isAppData,
	checkAppData,
	getAppDataPath
} from '../utils/file';
import { useSeahubStore } from '../stores/seahub';
import { formatAppDataNode } from '../utils/appdata';
// import { seahubGetRepos } from './syncMenu';
import { BtNotify, NotifyDefinedType } from '@bytetrade/ui';

import axios from 'axios';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// export async function fetch(url, loading, curItem) {
// 	const dataStore = useDataStore();
// 	const seahubStore = useSeahubStore();

// 	url = decodeURIComponent(removePrefix(url));

// 	let res = '';
// 	let data;

// 	try {
// 		if (checkSeahub(url)) {
// 			const currentItem = seahubStore.repo_name;
// 			let pathLen = url.indexOf(currentItem) + currentItem.length;
// 			const path = url.slice(pathLen);
// 			if (seahubStore.repo_id) {
// 				res = await fetchURL(
// 					`seahub/api/v2.1/repos/${seahubStore.repo_id}/dir/?p=${path}&with_thumbnail=true`,
// 					{}
// 				);
// 			} else {
// 				res = await seahubGetRepos(dataStore.activeMenu);
// 				if (Array.isArray(res)) {
// 					const [res1, res2] = res;
// 					res.data = {
// 						repos: [...res1.data, ...res2.data.repos]
// 					};
// 				}
// 			}
// 		} else if (checkAppData(url)) {
// 			const { path, node } = getAppDataPath(url);
// 			res = await fetchURL(`/api/resources/AppData${path}`, {}, true, node);
// 		} else {
// 			res = await fetchURL(`/api/resources${url}`, {});
// 		}

// 		data = await res.data;

// 		if (checkSeahub(url)) {
// 			if (seahubStore.repo_id) {
// 				data = formatSeahub(url, JSON.parse(JSON.stringify(data)));
// 			} else {
// 				data = formatSeahubRepos(dataStore.activeMenu, data);
// 			}
// 		} else if (isAppData(url)) {
// 			data = formatAppDataNode(url, JSON.parse(JSON.stringify(data)));
// 		}

// 		data.url = `/Files${url}`;

// 		if (data.isDir) {
// 			if (!data.url.endsWith('/')) data.url += '/';
// 			data.items = data.items.map((item, index) => {
// 				item.index = index;
// 				item.url = `${data.url}${encodeURIComponent(item.name)}`;
// 				if (item.isDir) {
// 					item.url += '/';
// 				}

// 				return item;
// 			});
// 		}
// 	} catch (error) {
// 		if (loading) {
// 			// notifyHide();
// 		}
// 		throw error;
// 	}

// 	if (loading) {
// 		// notifyHide();
// 	}

// 	return data;
// }

export async function resourceAction(url, method, content) {
	url = removePrefix(url);
	let opts = { method };

	if (content) {
		opts.headers = {
			'Content-Type': 'text/plain'
		};
		opts.data = content;
	}

	let res = null;
	if (checkAppData(url)) {
		const { path, node } = getAppDataPath(url);
		if (node) {
			opts.headers = {
				...opts.headers,
				'X-Terminus-Node': node
			};
			res = await fetchURL(`/api/resources/AppData${path}`, opts);
		}
	} else {
		res = await fetchURL(`/api/resources${url}`, opts);
	}
	return res;
}

export async function pasteAction(fromUrl, method, terminusNode) {
	let opts = { method };

	let res = null;
	if (checkAppData(fromUrl)) {
		const { path, node } = getAppDataPath(fromUrl);

		if (node) {
			opts.headers = {
				...opts.headers,
				'X-Terminus-Node': node,
				timeout: 600000
			};
			res = await fetchURL(`/api/paste/AppData${path}`, opts);
		}
	} else {
		if (terminusNode) {
			opts.headers = {
				...opts.headers,
				'X-Terminus-Node': terminusNode,
				timeout: 600000
			};
		}
		res = await fetchURL(`/api/paste${fromUrl}`, opts);
	}

	if (res?.data?.split('\n')[1] === '413 Request Entity Too Large') {
		return BtNotify.show({
			type: NotifyDefinedType.FAILED,
			message: res.data.split('\n')[0]
		});
	}

	return res;
}

export async function remove(url) {
	return resourceAction(url, 'DELETE');
}

export async function put(url, content = '') {
	return resourceAction(url, 'PUT', content);
}

export function download(format, ...files) {
	const store = useDataStore();
	const baseURL = store.baseURL();

	let url = `${baseURL}/api/raw`;
	let node = '';

	if (files.length === 1) {
		url += removePrefix(files[0]) + '?';
	} else {
		let arg = '';

		for (let file of files) {
			arg += removePrefix(file) + ',';
		}

		arg = arg.substring(0, arg.length - 1);
		arg = encodeURIComponent(arg);
		url += `/?files=${arg}&`;
	}

	if (format) {
		url += `algo=${format}&`;
	}

	if (store.jwt) {
		url += `auth=${store.jwt}&`;
	}

	// Handle /api/raw/AppData
	if (url.includes('/api/raw/AppData')) {
		try {
			const parts = url.split('/api/raw/AppData/');
			if (parts.length > 1 && parts[1].includes('/')) {
				const remainingPath = parts[1].substring(parts[1].indexOf('/') + 1);
				url = `${parts[0]}/api/raw/AppData/${remainingPath}`;
				node = parts[1].substring(0, parts[1].indexOf('/'));
			}
		} catch (e) {
			console.error(e);
		}
	}

	return { url, node };
}

export async function post(url, content = '', overwrite = false, onupload) {
	const store = useDataStore();
	const baseURL = store.baseURL();
	url = removePrefix(url);
	let bufferContent;
	if (
		content instanceof Blob &&
		!['http:', 'https:'].includes(window.location.protocol)
	) {
		bufferContent = await new Response(content).arrayBuffer();
	}

	return new Promise((resolve, reject) => {
		let request = new XMLHttpRequest();

		if (checkAppData(url)) {
			const { path, node } = getAppDataPath(url);
			if (node) {
				request.open(
					'POST',
					`${baseURL}/api/resources/AppData${path}?override=${overwrite}`,
					true
				);
				request.setRequestHeader('X-Terminus-Node', node);
			}
		} else {
			request.open(
				'POST',
				`${baseURL}/api/resources${url}?override=${overwrite}`,
				true
			);
		}

		if (typeof onupload === 'function') {
			request.upload.onprogress = onupload;
		}

		request.onload = () => {
			if (request.status === 200) {
				resolve(request.responseText);
			} else if (request.status === 409) {
				reject(request.status);
			} else {
				reject(request.responseText);
			}
		};

		request.onerror = () => {
			reject(new Error('001 Connection aborted'));
		};

		request.send(bufferContent || content);
	});
}

function moveCopy(items, copy = false, overwrite = false, rename = false) {
	let promises = [];
	const seahubStore = useSeahubStore();

	for (let item of items) {
		const from = item.from;

		let to = encodeURIComponent(item.to);
		let terminusNode = '';

		if (checkAppData(item.to)) {
			const { path, node } = getAppDataPath(item.to);
			to = encodeURIComponent(`/AppData${path}`);
			terminusNode = node;
		}

		let src_type = '';
		if (item.src_repo_id) {
			src_type = 'sync';
		} else {
			if (checkAppData(item.from)) {
				src_type = 'cache';
			} else {
				src_type = 'drive';
			}
		}

		let dst_type = '';
		if (seahubStore.repo_id) {
			dst_type = 'sync';
		} else {
			if (checkAppData(item.to)) {
				dst_type = 'cache';
			} else {
				dst_type = 'drive';
			}
		}

		const url = `${from}?action=${
			copy ? 'copy' : 'rename'
		}&destination=${to}&override=${overwrite}&rename=${rename}&src_type=${src_type}&dst_type=${dst_type}`;

		promises.push(pasteAction(url, 'PATCH', terminusNode));
	}

	return Promise.all(promises);
}

export async function rename(from, to) {
	const enc_to = encodeURIComponent(removePrefix(to));
	const url = `${from}?action=rename&destination=${enc_to}&override=${false}&rename=${false}`;
	const res = await resourceAction(url, 'PATCH');
	return res;
}

export function move(items, overwrite = false, rename = false) {
	return moveCopy(items, false, overwrite, rename);
}

export function copy(items, overwrite = false, rename = false) {
	return moveCopy(items, true, overwrite, rename);
}

export async function checksum(url, algo) {
	const data = await resourceAction(`${url}?checksum=${algo}`, 'GET');
	return (await data.json()).checksums[algo];
}

export function getDownloadURL(file, inline, download) {
	const params = {
		...(inline && { inline: 'true' })
	};
	const seahubStore = useSeahubStore();
	const store = useDataStore();
	const currentItemLength = store.currentItem.length;
	const startIndex = file.path.indexOf(store.currentItem) + currentItemLength;
	const hasSeahub = file.path.slice(startIndex);

	if (checkSeahub(file.path)) {
		if (['audio', 'video'].includes(file.type) && !download) {
			return file.url;
		} else {
			return `${store.baseURL()}/seahub/lib/${
				seahubStore.repo_id
			}/file${hasSeahub}?dl=1`;
		}
	} else {
		const url = createURL('api/raw' + file.path, params);
		return url;
	}
}

export function getPreviewURL(file, size) {
	const store = useDataStore();
	const params = {
		inline: 'true',
		key: Date.parse(file.modified)
	};
	const seahubStore = useSeahubStore();

	let seflSize = '1080';
	if (size === 'thumb') {
		seflSize = '48';
	}
	const currentItemLength = store.currentItem.length;
	const startIndex = file.path.indexOf(store.currentItem) + currentItemLength;
	const hasSeahub = file.path.slice(startIndex);

	if (checkSeahub(file.path)) {
		return `${store.baseURL()}/seahub/thumbnail/${
			seahubStore.repo_id
		}/${seflSize}${hasSeahub}`;
	} else {
		return createURL('api/preview/' + size + file.path, params);
	}
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

	if (checkSeahub(file.path)) {
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
	} else {
		if (['text', 'txt', 'textImmutable'].includes(file.type)) {
			try {
				const url = decodeURIComponent(file.path);
				const res = await fetchURL(`/api/resources${url}`, {});
				file.content = res.data.content;
			} catch (error) {
				console.error(error.message);
			}
		}
	}
	return file;
};

export function getSubtitlesURL(file) {
	const params = {
		inline: 'true'
	};

	const subtitles = [];
	for (const sub of file.subtitles) {
		subtitles.push(createURL('api/raw' + sub, params));
	}

	return subtitles;
}

export async function usage(url) {
	url = removePrefix(url);

	const res = await fetchURL(`/api/usage${url}`, {});

	return await res.data;
}

export async function getContentUrlByPath(filePath) {
	if (!filePath) {
		return;
	}
	const store = useDataStore();
	return await store.api.getFileDownloadLink(store.repo.repo_id, filePath);
}

const RETRY_TIMER = 3;
const SIZE = 8 * 1024 * 1024;

export async function uploadPost(
	url,
	content = '',
	overwrite = false,
	onupload,
	timer = RETRY_TIMER
) {
	const newurl = removePrefix(decodeURIComponent(url));

	let fileInfo = null;
	let appNode = null;

	if (checkAppData(newurl)) {
		const { path, node } = getAppDataPath(newurl);
		appNode = node;
		if (node) {
			fileInfo = await getUploadInfo(path, `/appdata`, content);
		} else {
			return false;
		}
	} else {
		fileInfo = await getUploadInfo(newurl, '/data', content);
	}

	const fileChunkList = await createFileChunk(fileInfo, content);

	const exportProgress = (e) => {
		if (typeof onupload === 'function') {
			onupload(e);
		}
	};

	return new Promise(async (resolve, reject) => {
		for (let i = 0; i < fileChunkList.length; i++) {
			const chunkFile = fileChunkList[i];
			try {
				const res = await uploadChunks(
					fileInfo,
					chunkFile,
					i,
					exportProgress,
					appNode
				);
				if (res.message === 'File uploaded successfully') {
					resolve();
				}
			} catch (error) {
				if (timer === 1) {
					exportProgress({
						loaded: -1,
						total: fileInfo.file_size,
						lengthComputable: true
					});
				}
				if (timer <= 0) {
					reject();
					return;
				}

				await errorRetry(url, content, overwrite, onupload, timer);
				return;
			}
		}
		resolve();
	});
}

export async function errorRetry(
	url,
	content = '',
	overwrite = false,
	onupload,
	timer
) {
	timer = timer - 1;
	await uploadPost(url, content, overwrite, onupload, timer);
}

export async function uploadChunks(
	fileInfo,
	chunkFile,
	i,
	exportProgress,
	node
) {
	const store = useDataStore();
	const baseURL = store.baseURL();

	return new Promise(async (resolve, reject) => {
		let request = new XMLHttpRequest();
		let params = new FormData();
		const offset = fileInfo.offset + SIZE * i;

		params.append('file', chunkFile.file);
		params.append('upload_offset', offset);
		request.open('PATCH', `${baseURL}/upload/${fileInfo.id}`, true);
		if (node) {
			request.setRequestHeader('X-Terminus-Node', node);
		}

		request.timeout = 600000;
		request.onload = () => {
			if (request.status === 200) {
				resolve(JSON.parse(request.responseText));
			} else if (request.status === 409) {
				reject(request.status);
			} else {
				reject(request.responseText);
			}
		};

		request.upload.onprogress = function (e) {
			const event = {
				loaded: e.loaded,
				total: e.total,
				lengthComputable: e.lengthComputable
			};

			if (event.lengthComputable) {
				event.loaded += offset;
				event.total = fileInfo.file_size;
				exportProgress(event);
			}
		};

		request.onerror = () => {
			reject(new Error('001 Connection aborted'));
		};

		request.send(params);
	});
}

export async function createFileChunk(fileInfo, file, size = SIZE) {
	const fileChunkList = [];
	let cur = fileInfo.offset;
	while (cur < file.size) {
		fileChunkList.push({ file: file.slice(cur, cur + size) });
		cur += size;
	}

	return fileChunkList;
}

export async function getUploadInfo(url, prefix, content = '') {
	const store = useDataStore();
	const baseURL = store.baseURL();
	const appendUrl = splitUrl(url, content);
	let params = new FormData();
	params.append('storage_path', `${prefix}${appendUrl.storage_path}`);
	params.append('file_relative_path', appendUrl.file_relative_path);
	params.append('file_type', content.type);
	params.append('file_size', content.size);

	const res = await axios.post(baseURL + '/upload', params);
	return res;
}

const splitUrl = (url, content) => {
	let storage_path = '';
	let file_relative_path = '';
	let slicePathIndex = 0;
	if (content.fullPath) {
		slicePathIndex = url.indexOf(content.fullPath);
		file_relative_path = content.fullPath;
	} else {
		slicePathIndex = url.indexOf(content.name);
		file_relative_path = content.name;
	}

	storage_path = url.slice(0, slicePathIndex);
	return {
		storage_path,
		file_relative_path
	};
};
