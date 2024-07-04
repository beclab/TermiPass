import { HttpResponse } from '@capacitor/core';

import axios, {
	AxiosInstance,
	AxiosRequestConfig,
	AxiosResponse,
	Method
} from 'axios';
import { getAppPlatform } from './appPlatform';
import { InOfflineMode } from '../utils/checkTerminusState';
import { useTermipassStore } from 'src/stores/termipass';
import { TermiPassStatus } from 'src/utils/termipassState';

type RequestInterceptor = (
	config: AxiosRequestConfig
) => AxiosRequestConfig | Promise<AxiosRequestConfig>;
type ResponseInterceptor = (
	response: AxiosResponse
) => AxiosResponse | Promise<AxiosResponse>;

export interface AxiosInstanceWithIntercept extends AxiosInstance {
	interceptRequest: (callback: RequestInterceptor) => void;
	interceptResponse: (callback: ResponseInterceptor) => void;

	requestIntercepts: RequestInterceptor[];
	responseIntercepts: ResponseInterceptor[];
}

const interceptors = {
	request: [] as RequestInterceptor[],
	response: [] as ResponseInterceptor[]
};

const totalHookMethod = [
	'get',
	'delete',
	'head',
	'options',
	'post',
	'put',
	'patch',
	'request'
];

export const axiosProxyHandler: ProxyHandler<AxiosInstanceWithIntercept> = {
	get: function (target, prop: Method) {
		const termipassStore = useTermipassStore();
		if (
			!getAppPlatform().isHookHttpRequest ||
			!totalHookMethod.includes(prop.toLowerCase()) ||
			termipassStore.totalStatus?.status == TermiPassStatus.OfflineMode
		) {
			return Reflect.get(target, prop);
		}
		return formatHookRequest(target, prop);
	},
	async apply(target, thisArg, argumentsList: AxiosRequestConfig[]) {
		const [config] = argumentsList;

		const termipassStore = useTermipassStore();
		if (
			!getAppPlatform().isHookHttpRequest ||
			!totalHookMethod.includes(config.method?.toLowerCase() || 'get') ||
			termipassStore.totalStatus?.status == TermiPassStatus.OfflineMode
		) {
			return Reflect.apply(target, thisArg, argumentsList);
		}

		const reConfig = {
			...target.defaults,
			...config
		};
		return await requestCommonCallBack(
			target,
			config?.url || '',
			reConfig,
			config?.method || 'get'
		);
	}
};

const formatHookRequest = (
	target: AxiosInstanceWithIntercept,
	prop: string
) => {
	if (['get', 'delete', 'head', 'options'].includes(prop)) {
		return async function (url: string, config?: AxiosRequestConfig) {
			const reConfig = {
				...target.defaults,
				...config,
				url,
				method: prop as Method
			};
			return await requestCommonCallBack(target, url, reConfig, prop as Method);
		};
	} else if (['post', 'put', 'patch'].includes(prop)) {
		return async function (
			url: string,
			data?: any,
			config?: AxiosRequestConfig
		) {
			const reConfig = {
				...target.defaults,
				...config,
				url,
				method: prop as Method,
				data
			};
			return await requestCommonCallBack(target, url, reConfig, prop as Method);
		};
	} else if (prop === 'request') {
		return async function (config?: AxiosRequestConfig) {
			const reConfig = {
				...target.defaults,
				...config
			};
			return await requestCommonCallBack(
				target,
				config?.url || '',
				reConfig,
				config?.method || 'get'
			);
		};
	}
};

// 定义一个自定义对象构造函数
class ErrorResponse {
	response: AxiosResponse<any>;
	message: string;
	constructor(response: AxiosResponse<any>, message: string) {
		this.response = response;
		this.message = message;
	}
	toString(): string {
		return this.message;
	}
}

const requestCommonCallBack = async (
	target: AxiosInstanceWithIntercept,
	url: string,
	config: AxiosRequestConfig,
	prop: Method
) => {
	for (const interceptor of interceptors.request) {
		config = (await interceptor(config)) || config;
	}

	for (const interceptor of target.requestIntercepts) {
		config = (await interceptor(config)) || config;
	}
	const fullUrl = config.baseURL
		? new URL(url, config.baseURL).toString()
		: url;

	const response: HttpResponse =
		await getAppPlatform().hookCapacitorHttp.request({
			method: prop.toUpperCase(),
			url: fullUrl,
			params: config.params,
			data: config.data,
			headers: config.headers,
			responseType: config.responseType as any
		});

	let axiosResponse: AxiosResponse = {
		data: response.data,
		status: response.status,
		statusText: '',
		headers: response.headers,
		config: config,
		request: null
	};

	for (const interceptor of interceptors.response) {
		axiosResponse = (await interceptor(axiosResponse)) || axiosResponse;
	}

	for (const interceptor of target.responseIntercepts) {
		axiosResponse = (await interceptor(axiosResponse)) || axiosResponse;
	}

	if (axiosResponse.status !== 200 && axiosResponse.status !== 201) {
		return Promise.reject(
			new ErrorResponse(
				axiosResponse,
				axiosResponse.data.message
					? `${axiosResponse.data.message}`
					: `Request failed with status code ${axiosResponse.status}`
			)
		);
	}

	return axiosResponse;
};

export const axiosInstanceProxy = (config: AxiosRequestConfig) => {
	const instance = axios.create({
		...config
	});

	const termipassStore = useTermipassStore();

	instance.interceptors.request.use((config) => {
		if (termipassStore.totalStatus?.status == TermiPassStatus.OfflineMode) {
			return Promise.reject(new Error(InOfflineMode));
		}
		return config;
	});

	const instanceProxy = new Proxy(
		instance,
		axiosProxyHandler
	) as AxiosInstanceWithIntercept;

	instanceProxy.requestIntercepts = [];
	instanceProxy.responseIntercepts = [];

	instanceProxy.interceptRequest = (config) => {
		instanceProxy.requestIntercepts.push(config);
	};

	instanceProxy.interceptResponse = (config) => {
		instanceProxy.responseIntercepts.push(config);
	};

	return instanceProxy;
};

export const addAxiosProxyGlobalRequestInterceptor = (
	callback: RequestInterceptor
) => {
	interceptors.request.push(callback);
};

export const addAxiosProxyGlobalResponseInterceptor = (
	callback: ResponseInterceptor
) => {
	interceptors.response.push(callback);
};
