import { defineStore } from 'pinia';
import { Board, Category } from '../extension/rss/model/type';
import { create_feed, save_entry } from '../extension/rss/utils/api';

import { useUserStore } from './user';
import { AxiosInstance } from 'axios';
import { axiosInstanceProxy } from 'src/platform/httpProxy';
import { downloadPdf, getDownloadPdfProgress } from '../api/pdf';
import { BtNotify, NotifyDefinedType } from '@bytetrade/ui';
import { i18n } from 'src/boot/i18n';
import {
	DOWNLOAD_STATUS,
	DownloadProgress
} from '../pages/Mobile/collect/utils';
import { bus } from '../utils/bus';

export type DataState = {
	categories: Category[];
	boards: Board[];
	instance?: AxiosInstance;

	waitingQueue: DownloadProgress[];
	downloadTasks: Record<string, DownloadProgress>;
	timer: any;
};

export const useRssStore = defineStore('rss', {
	state: () => {
		return {
			categories: [],
			boards: [],
			waitingQueue: [],
			downloadTasks: {},
			timer: null
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
		},

		async downloadPdf(url: string, fileName: string): Promise<string | null> {
			const find = this.waitingQueue.some((entry) => entry.url === url);
			if (find) {
				console.log(`reject : ${fileName} is waiting download`);
				return null;
			}
			for (const key in this.downloadTasks) {
				const task = this.downloadTasks[key];
				if (task.status === DOWNLOAD_STATUS.DOWNLOADING && task.url === url) {
					console.log(`reject : ${fileName} is downloading`);
					return null;
				}
			}
			const entry = await downloadPdf(url, fileName);
			if (entry) {
				this.addTask(entry, fileName);
				return entry._id;
			} else {
				BtNotify.show({
					type: NotifyDefinedType.FAILED,
					message: fileName + ' download start failed'
				});
				console.log(`reject : ${fileName} downloadPdf return error`);
				return null;
			}
		},

		addTask(entry: any, fileName: string) {
			this.waitingQueue.push({
				id: entry._id,
				url: entry.url,
				fileName: entry.title ? entry.title : fileName,
				status: DOWNLOAD_STATUS.DOWNLOADING,
				total: 100,
				download: 0,
				isLoading: false
			});
			this.startInterval();
		},
		startInterval() {
			if (!this.timer) {
				this.timer = setInterval(() => {
					this.waitingQueue.forEach((progress) => {
						this.downloadTasks[progress.id] = progress;
					});

					this.waitingQueue = [];

					const queryList: DownloadProgress[] = [];
					for (const key in this.downloadTasks) {
						const task = this.downloadTasks[key];
						if (task.status === DOWNLOAD_STATUS.DOWNLOADING) {
							queryList.push(task);
						}
					}

					console.log('do', queryList.length);

					if (queryList.length == 0 && this.waitingQueue.length == 0) {
						clearInterval(this.timer);
						this.timer = null;
						console.log('clear');
						return;
					}

					queryList.forEach((task) => {
						if (!task.isLoading) {
							this.queryDownloadPdfProgress(task);
						}
					});
				}, 1000);
			}
		},
		async queryDownloadPdfProgress(task: DownloadProgress) {
			this.downloadTasks[task.id].isLoading = true;
			const progress = await getDownloadPdfProgress(task.id);
			if (progress) {
				this.downloadTasks[task.id].isLoading = false;
				this.downloadTasks[task.id].status = progress.status;
				this.downloadTasks[task.id].download = progress.download;
				this.downloadTasks[task.id].total = progress.total;
				bus.emit('DOWNLOAD_PROGRESS_UPDATE', this.downloadTasks[task.id]);
				if (progress.status === DOWNLOAD_STATUS.FAILED) {
					BtNotify.show({
						type: NotifyDefinedType.FAILED,
						message: i18n.global.t('pdf.download_failed')
					});
				}
			}
		}
	}
});
