import { defineStore } from 'pinia';
import { Board, Category } from '../extension/rss/model/type';
import { create_feed, save_entry } from '../extension/rss/utils/api';

import { useUserStore } from './user';
import { AxiosInstance } from 'axios';
import { axiosInstanceProxy } from 'src/platform/httpProxy';

export type DataState = {
	categories: Category[];
	boards: Board[];
	instance?: AxiosInstance;
};

export const useRssStore = defineStore('rss', {
	state: () => {
		return {
			categories: [],
			boards: []
		} as DataState;
	},
	getters: {
		me_name(): string | undefined {
			const userStore = useUserStore();
			if (userStore.current_user) {
				return userStore.current_user.name;
			} else {
				return undefined;
			}
		}
	},
	actions: {
		get_local_category(id: number): Category | undefined {
			return this.categories.find((category) => category.id == id);
		},

		async create_feed(feed_url: string) {
			try {
				const data = await create_feed({
					feed_url,
					source: 'wise'
				});
				return data;
			} catch (error) {
				return undefined;
			}
		},

		async addEntry(url: string) {
			return await save_entry([
				{
					url,
					source: 'library'
				}
			]);
		},

		initInstance() {
			const userStore = useUserStore();
			if (!userStore.current_user) {
				this.instance = undefined;
				return;
			}
			const url = userStore.getModuleSever('wise');
			this.instance = axiosInstanceProxy({
				baseURL: url,
				timeout: 10000,
				headers: {
					'Content-Type': 'application/json',
					'X-Authorization': userStore.current_user.access_token
				}
			});
		}
	}
});
