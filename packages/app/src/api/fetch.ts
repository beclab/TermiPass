// import { axiosInstanceProxy } from '../platform/httpProxy';
import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { busEmit, NetworkErrorMode } from '../utils/bus';
import { InOfflineMode } from '../utils/checkTerminusState';

import { useDataStore } from '../stores/data';

const defaultConfig: AxiosRequestConfig = {
	baseURL: '',
	timeout: 600000,
	headers: {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type',
		'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS,PATCH',
		'Content-Type': 'application/json',
		'X-Unauth-Error': 'Non-Redirect'
	}
};

class Fetch {
	private instance: AxiosInstance;

	constructor() {
		this.init();
	}
	public async init(): Promise<void> {
		try {
			// Delayed reference axiosInstanceProxy
			const { axiosInstanceProxy } = await import('../platform/httpProxy');
			const instance = axiosInstanceProxy({
				...defaultConfig
			});

			instance.interceptRequest((config) => {
				const dataStore = useDataStore();
				config.baseURL = dataStore.baseURL();
				return config;
			});

			this.instance = instance;

			this.instance.interceptors.request.use(
				(config) => {
					const dataStore = useDataStore();
					config.baseURL = dataStore.baseURL();
					return config;
				},
				(error) => {
					return Promise.reject(error);
				}
			);

			this.instance.interceptors.response.use(
				(response) => {
					return response;
				},
				(error) => {
					if (error.message == InOfflineMode) {
						throw error;
					}
					busEmit('network_error', {
						type: NetworkErrorMode.file,
						error: error.message
					});
				}
			);
		} catch (error) {
			console.error('Error fetching data:', error);
		}
	}

	public async get<T = any>(
		url: string,
		config?: AxiosRequestConfig
	): Promise<T> {
		const response: AxiosResponse<T> = await this.instance.get(url, config);
		return response.data;
	}

	async post<T = any>(
		url: string,
		data?: any,
		config?: AxiosRequestConfig
	): Promise<AxiosResponse<T>> {
		return this.instance.post(url, data, config);
	}

	async put<T = any>(
		url: string,
		data?: any,
		config?: AxiosRequestConfig
	): Promise<AxiosResponse<T>> {
		return this.instance.put(url, data, config);
	}

	async delete<T = any>(
		url: string,
		config?: AxiosRequestConfig
	): Promise<AxiosResponse<T>> {
		return this.instance.delete(url, config);
	}

	async patch<T = any>(
		url: string,
		config?: AxiosRequestConfig
	): Promise<AxiosResponse<T>> {
		return this.instance.patch(url, {}, config);
	}
}

const CommonFetch = new Fetch();

export { CommonFetch };
