import { createURL, fetchURL, removePrefix } from './utils';
import { dataAPIs, DriveDataAPI } from './index';
import { useDataStore } from '../stores/data';
import { checkAppData, getAppDataPath } from '../utils/file';
import { useSeahubStore } from '../stores/seahub';
// import { seahubGetRepos } from './syncMenu';
import { BtNotify, NotifyDefinedType } from '@bytetrade/ui';

import axios from 'axios';

export async function resourceAction(
	url: string,
	method: string,
	content?: any
) {
	url = removePrefix(url);
	const opts: any = { method };

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

export async function pasteAction(fromUrl, terminusNode): Promise<any> {
	const opts: any = {};
	const dataAPI = dataAPIs();

	let res: any;
	if (checkAppData(fromUrl)) {
		const { path, node } = getAppDataPath(fromUrl);

		if (node) {
			opts.headers = {
				...opts.headers,
				'X-Terminus-Node': node,
				timeout: 600000
			};
			res = await dataAPI.commonAxios.patch(`/api/paste/AppData${path}`, opts);
		}
	} else {
		if (terminusNode) {
			opts.headers = {
				...opts.headers,
				'X-Terminus-Node': terminusNode,
				timeout: 600000
			};
		}
		res = await dataAPI.commonAxios.patch(`/api/paste${fromUrl}`, opts);
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

		for (const file of files) {
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
		new Blob([content], { type: 'text/plain' }) instanceof Blob &&
		!['http:', 'https:'].includes(window.location.protocol)
	) {
		bufferContent = await new Response(content).arrayBuffer();
	}

	return new Promise((resolve, reject) => {
		const request = new XMLHttpRequest();

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
	const promises: any[] = [];
	const seahubStore = useSeahubStore();

	for (const item of items) {
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

		promises.push(pasteAction(url, terminusNode));
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
	const data: any = await resourceAction(`${url}?checksum=${algo}`, 'GET');
	return (await data.json()).checksums[algo];
}

// export const formatFileContent = async (file) => {
// 	console.log('drive formatFileContent start', file);
// 	const store = useDataStore();
// 	const seahubStore = useSeahubStore();
// 	if (
// 		!['audio', 'video', 'text', 'txt', 'textImmutable', 'pdf'].includes(
// 			file.type
// 		)
// 	) {
// 		return file;
// 	}

// 	if (checkSeahub(file.path)) {
// 		const currentItemLength = store.currentItem.length;
// 		const startIndex = file.path.indexOf(store.currentItem) + currentItemLength;
// 		const hasSeahub = file.path.slice(startIndex);
// 		const res = await fetchURL(
// 			`/seahub/lib/${seahubStore.repo_id}/file${hasSeahub}?dict=1`,
// 			{}
// 		);
// 		if (['audio', 'video', 'pdf'].includes(file.type)) {
// 			file.url = store.baseURL() + res.data.raw_path; //res.data.raw_path
// 		} else if (['text', 'txt', 'textImmutable'].includes(file.type)) {
// 			file.content = res.data.file_content;
// 		}
// 	} else {
// 		if (['text', 'txt', 'textImmutable'].includes(file.type)) {
// 			try {
// 				const url = decodeURIComponent(file.path);
// 				const res = await fetchURL(`/api/resources${url}`, {});
// 				file.content = res.data.content;
// 			} catch (error) {
// 				console.error(error.message);
// 			}
// 		}
// 	}
// 	console.log('formatFileContent end', file);
// 	return file;
// };

export function getSubtitlesURL(file) {
	const params = {
		inline: 'true'
	};

	const subtitles: string[] = [];
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
	return '';
	// const store = useDataStore();
	// return await store.api.getFileDownloadLink(store.repo.repo_id, filePath);
}

export async function errorRetry(
	url,
	content: File,
	overwrite = false,
	onupload,
	timer
) {
	timer = timer - 1;
	const dataAPI = dataAPIs();

	await (dataAPI as DriveDataAPI).fetchUploader(
		url,
		content,
		overwrite,
		onupload,
		timer
	);
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
	const dataAPI = dataAPIs();

	const formData = new FormData();

	const offset = fileInfo.offset + dataAPI.SIZE * i;
	formData.append('file', chunkFile.file);
	formData.append('upload_offset', offset);

	const headers = {};
	if (node) {
		headers['X-Terminus-Node'] = node;
	}

	try {
		const response = await dataAPI.commonAxios.patch(
			`${baseURL}/upload/${fileInfo.id}`,
			formData,
			{
				...headers,
				onUploadProgress: (progressEvent) => {
					const event = {
						loaded: progressEvent.loaded,
						total: progressEvent.total,
						lengthComputable: progressEvent.lengthComputable
					};
					if (progressEvent.lengthComputable) {
						event.loaded += offset;
						event.total = fileInfo.file_size;
						exportProgress(event);
					}
				}
			}
		);

		console.log(response.data);
	} catch (error) {
		console.error(error);
	}
}

export async function createFileChunk(fileInfo: { offset: any }, file: any) {
	const dataAPI = dataAPIs();
	const size = dataAPI.SIZE;
	const fileChunkList: { file: string }[] = [];
	let cur = fileInfo.offset;
	while (cur < file.size) {
		fileChunkList.push({ file: file.slice(cur, cur + size) });
		cur += size;
	}

	return fileChunkList;
}

export async function getUploadInfo(url: string, prefix: string, content: any) {
	const store = useDataStore();
	const baseURL = store.baseURL();
	const appendUrl = splitUrl(url, content);
	const params = new FormData();
	params.append('storage_path', `${prefix}${appendUrl.storage_path}`);
	params.append('file_relative_path', appendUrl.file_relative_path);
	params.append('file_type', content.type);
	params.append('file_size', String(content.size));

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
