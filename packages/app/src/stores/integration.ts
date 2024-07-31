import { defineStore } from 'pinia';
import { axiosInstanceProxy } from 'src/platform/httpProxy';
import { useUserStore } from './user';
import {
	AccountType,
	IntegrationAccount,
	IntegrationAccountMiniData
} from 'src/services/abstractions/integration/integrationService';

export type IntegrationState = {
	accounts: IntegrationAccountMiniData[];
};

export const useIntegrationStore = defineStore('integration', {
	state: () => ({ accounts: [] } as IntegrationState),

	getters: {},

	actions: {
		async getAccount(
			type: AccountType | 'all'
		): Promise<IntegrationAccountMiniData[]> {
			const instance = this.createAxiosInstanceProxy();
			const result = await instance.get('/api/account/' + type);

			const spaces: IntegrationAccountMiniData[] = [];
			const othes: IntegrationAccountMiniData[] = [];
			if (result && result.data) {
				for (let index = 0; index < result.data.data.length; index++) {
					const element = result.data.data[index] as IntegrationAccountMiniData;
					if (element.type == AccountType.Space) {
						spaces.push(element);
					} else {
						othes.push(element);
					}
				}
			}
			const data = [...spaces, ...othes];
			if (type == 'all' && result && result.data) {
				this.accounts = data;
			}
			return data;
		},
		async getAccountByTypeAndName(
			type: AccountType,
			name: string
		): Promise<IntegrationAccountMiniData[]> {
			const instance = this.createAxiosInstanceProxy();
			const result = await instance.get(`/api/account/` + type + '/' + name);
			return result.data.data;
		},
		async createAccount(data: IntegrationAccount) {
			const instance = this.createAxiosInstanceProxy();
			return await instance.post('/api/account/create', data);
		},
		async deleteAccount(data: IntegrationAccountMiniData) {
			const instance = this.createAxiosInstanceProxy();
			const key = this.get_store_key(data);
			return await instance.delete(`/api/account/${key}`);
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
		},
		get_store_key(data: IntegrationAccountMiniData | IntegrationAccount) {
			if (data.name) {
				return 'integration-account:' + data.type + ':' + data.name;
			} else {
				return 'integration-account:' + data.type;
			}
		}
	}
});
