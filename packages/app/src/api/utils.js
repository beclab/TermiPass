import axios from 'axios';
import { logout } from '../utils/auth';
import { encodePath } from '../utils/url';
import { useDataStore } from '../stores/data';
import { busEmit, NetworkErrorMode } from '../utils/bus';
import { axiosInstanceProxy } from '../platform/httpProxy';
import { InOfflineMode } from '../utils/checkTerminusState';

export async function fetchURL(url, opts, auth = true, node = '') {
	const store = useDataStore();
	let baseURL = store.baseURL();
	opts = opts || {};
	opts.headers = opts.headers || {};

	let { headers, ...rest } = opts;

	try {
		if (node) {
			headers = {
				'X-Terminus-Node': node,
				...headers
			};
		}
	} catch (e) {
		console.error(e);
	}
	const instance = axiosInstanceProxy({
		baseURL: baseURL,
		timeout: opts.timeout || 10000
	});
	headers = {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type',
		'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS,PATCH',
		'Content-Type': 'application/json',
		'X-Unauth-Error': 'Non-Redirect',
		...headers
	};

	const cancelTokenArr = ['api/resources/Home', 'seahub/api/v2.1/repos'];
	let pending = [];
	const cancelToken = axios.CancelToken;
	const removePending = (config) => {
		if (pending.length <= 0) return;
		for (const p in pending) {
			if (pending[p].u === config.url.split('?')[0] + '&' + config.method) {
				pending[p].f();
				pending.splice(Number(p), 1);
			}
		}
	};

	instance.interceptors.request.use(
		(config) => {
			removePending(config);
			config.cancelToken = new cancelToken((c) => {
				const pendingFind = cancelTokenArr.find((item) => {
					return config.url.indexOf(item) > -1;
				});
				if (pendingFind) {
					pending.push({
						u: config.url.split('?')[0] + '&' + config.method,
						f: c
					});
				}
			});
			return config;
		},
		(error) => {
			pending = [];
			return Promise.reject(error);
		}
	);

	instance.interceptors.response.use(
		(response) => {
			for (let p in pending) {
				if (
					pending[p].u ===
					response.config.url.split('?')[0] + '&' + response.config.method
				) {
					pending.splice(p, 1);
				}
			}
			return response;
		},
		async (error) => {
			pending = [];
			if (error.message == InOfflineMode) {
				throw error;
			}
			busEmit('network_error', {
				type: NetworkErrorMode.file,
				error: error.message
			});
		}
	);

	let res = null;
	try {
		res = await instance({
			url: url,
			method: opts.method || 'get',
			baseURL: baseURL,
			headers: {
				...headers
			},
			...rest
		});
	} catch (e) {
		if (e.message == InOfflineMode) {
			e.status;
			throw e;
		}
		const error = new Error('000 No connection');
		throw error;
	}
	if (res.redirect) {
		const selfUrl =
			'/api/' + res.redirect.slice(res.redirect.indexOf('resources'));
		return fetchURL(selfUrl, {});
	}
	if (res.status === 459) {
		return window.history.go(-1);
	}
	if (res.status < 200 || res.status > 299) {
		const error = new Error(await res.text());
		error.status = res.status;
		if (auth && res.status == 401) {
			logout();
		}
		throw error;
	}
	return res;
}

export async function fetchJSON(url, opts) {
	const res = await fetchURL(url, opts);

	if (res.status === 200) {
		return res.json();
	} else {
		throw new Error(res.status);
	}
}

export function removePrefix(url) {
	url = url.split('/').splice(2).join('/');
	if (url === '') url = '/';
	if (url[0] !== '/') url = '/' + url;
	return url;
}

export function createURL(endpoint, params = {}, auth = true) {
	const store = useDataStore();
	const baseURL = store.baseURL();

	let prefix = baseURL;
	if (!prefix.endsWith('/')) {
		prefix = prefix + '/';
	}
	const url = new URL(prefix + encodePath(endpoint), origin);

	const searchParams = {
		...(auth && { auth: store.jwt }),
		...params
	};

	for (const key in searchParams) {
		url.searchParams.set(key, searchParams[key]);
	}

	return url.toString();
}
