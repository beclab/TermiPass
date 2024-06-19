import { defineStore } from 'pinia';
import { axiosInstanceProxy } from 'src/platform/httpProxy';
import { useUserStore } from './user';
import {
	AccountType,
	IntegrationAccount
} from 'src/services/abstractions/opendal/opendalService';

export const useOpendalStore = defineStore('opendal', {
	state: () => ({
		counter: 0
	}),

	getters: {},

	actions: {
		async getAccount(type: AccountType | 'all') {
			const instance = this.createAxiosInstanceProxy();
			const result = await instance.get('/api/account/' + type);
			return result.data.data;
		},
		async createAccount(data: IntegrationAccount) {
			const instance = this.createAxiosInstanceProxy();
			return await instance.post('/api/account/create', data);
		},
		createAxiosInstanceProxy() {
			const userStore = useUserStore();
			const baseURL = userStore.getModuleSever('settings');
			return axiosInstanceProxy({
				baseURL: baseURL,
				timeout: 1000 * 10,
				headers: {
					'Content-Type': 'application/json',
					'X-Authorization': userStore.current_user?.access_token
				}
			});
		}
	}
});
