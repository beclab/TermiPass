import { defineStore } from 'pinia';
import { useUserStore } from './user';
import {
	downloadPdf,
	getDownloadPdfProgress,
	queryPdfEntry
} from '../extension/rss/utils/pdf';
import { BtNotify, NotifyDefinedType } from '@bytetrade/ui';
import { i18n } from 'src/boot/i18n';
import {
	BaseCollectInfo,
	DOWNLOAD_STATUS,
	DownloadProgress,
	PDFInfo,
	PDFStatus,
	RssInfo,
	RssStatus
} from '../pages/Mobile/collect/utils';
import { saveFeed, queryFeed } from '../extension/rss/utils/feed';
import { saveEntry, queryEntry } from '../extension/rss/utils/entry';
import { notifyFailed, notifySuccess } from '../utils/notifyRedefinedUtil';
import { rsshubDomain, rsshubReplaceDomain } from '../extension/rss/utils';

export type DataState = {
	baseUrl: string;
	pagesList: RssInfo[];
	rssList: RssInfo[];
	pdfList: PDFInfo[];
	waitingQueue: DownloadProgress[];
	downloadTasks: Record<string, DownloadProgress>;
	timer: any;
};

export const useCollectStore = defineStore('collect', {
	state: () => {
		return {
			baseUrl: '',
			pagesList: [],
			rssList: [],
			pdfList: [],
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
		async setRssList(pagesList: BaseCollectInfo[], rssList: BaseCollectInfo[]) {
			const userStore = useUserStore();
			this.baseUrl = userStore.getModuleSever('wise');
			const pageList: RssInfo[] = [];
			const pdfList: PDFInfo[] = [];
			for (const page of pagesList) {
				if (page.url.endsWith('.pdf')) {
					const data = page as PDFInfo;
					const result = await queryPdfEntry(data.url);
					if (result) {
						data.status = PDFStatus.success;
					} else {
						data.status = PDFStatus.none;
					}
					pdfList.push(data);
				} else {
					const data = page as RssInfo;
					const result = await queryEntry(data.url);
					if (result) {
						data.status = RssStatus.added;
					} else {
						data.status = RssStatus.none;
					}
					pageList.push(data);
				}
			}
			this.pagesList = pageList;
			this.pdfList = pdfList;
			this.rssList = [];
			for (const rss of rssList) {
				const data = rss as RssInfo;
				data.url = data.url.startsWith(rsshubDomain)
					? rsshubReplaceDomain + data.url.substring(rsshubDomain.length)
					: data.url;
				const result = await queryFeed(data.url);
				if (result) {
					data.status = RssStatus.added;
				} else {
					data.status = RssStatus.none;
				}
				this.rssList.push(data);
			}
			console.log(this.pagesList);
			console.log(this.rssList);
			console.log(this.pdfList);
		},
		async addFeed(item: RssInfo) {
			try {
				await saveFeed({
					feed_url: item.url,
					source: 'wise'
				});
				item.status = RssStatus.added;
				notifySuccess(i18n.global.t('add_feed_success'));
			} catch (e) {
				console.log(e.message);
				item.status = RssStatus.removed;
				notifyFailed(i18n.global.t('add_feed_fail') + e.message);
			}
		},

		async addEntry(item: RssInfo) {
			try {
				await saveEntry([
					{
						url: item.url,
						source: 'library'
					}
				]);
				item.status = RssStatus.added;
				notifySuccess(i18n.global.t('add_page_success'));
			} catch (e) {
				console.log(e.message);
				item.status = RssStatus.removed;
				notifyFailed(i18n.global.t('add_page_fail') + e.message);
			}
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

				const pdfInfo = this.pdfList.find((item) => item.id === progress.id);
				if (pdfInfo) {
					pdfInfo.progress = progress;
					if (progress.status === DOWNLOAD_STATUS.SUCCESS) {
						pdfInfo.status = PDFStatus.success;
					}
					if (progress.status === DOWNLOAD_STATUS.FAILED) {
						pdfInfo.status = PDFStatus.error;
					}
				}

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
