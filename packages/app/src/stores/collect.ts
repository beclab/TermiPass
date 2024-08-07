import { defineStore } from 'pinia';
import { useUserStore } from './user';
import { downloadFile, getDownloadHistory } from '../extension/rss/utils/pdf';
import { i18n } from 'src/boot/i18n';
import {
	BaseCollectInfo,
	DownloadProgress,
	RssInfo,
	RssStatus
} from '../pages/Mobile/collect/utils';
import { saveFeed, queryFeed } from '../extension/rss/utils/feed';
import { saveEntry, queryEntry } from '../extension/rss/utils/entry';
import { notifyFailed, notifySuccess } from '../utils/notifyRedefinedUtil';
import {
	FileInfo,
	rsshubDomain,
	rsshubReplaceDomain,
	DownloadRecord,
	CompareDownloadRecord,
	DOWNLOAD_RECORD_STATUS,
	DownloadRecordRequest,
	DownloadFileRecord
} from '../extension/rss/utils';
import { binaryInsert } from 'src/utils/utils';

export type DataState = {
	baseUrl: string;
	pagesList: RssInfo[];
	rssList: RssInfo[];
	filesDownloadHistoryList: DownloadRecord[];
	waitingQueue: DownloadProgress[];
	queryTimer: any;
	filesList: DownloadFileRecord[];
};

export const useCollectStore = defineStore('collect', {
	state: () => {
		return {
			baseUrl: '',
			pagesList: [],
			rssList: [],
			filesDownloadHistoryList: [],
			waitingQueue: [],
			downloadTasks: {},
			filesList: [],
			queryTimer: null
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
		async setRssList(
			pagesList: BaseCollectInfo[],
			filesList: FileInfo[],
			rssList: BaseCollectInfo[]
		) {
			const userStore = useUserStore();
			this.baseUrl = userStore.getModuleSever('wise');
			const pageList: RssInfo[] = [];
			// const pdfList: PDFInfo[] = [];
			for (const page of pagesList) {
				// if (page.url.endsWith('.pdf')) {
				// 	const data = page as PDFInfo;
				// 	const result = await queryPdfEntry(data.url);
				// 	if (result) {
				// 		data.status = PDFStatus.success;
				// 	} else {
				// 		data.status = PDFStatus.none;
				// 	}
				// 	pdfList.push(data);
				// } else {
				const data = page as RssInfo;
				const result = await queryEntry(data.url);
				if (result) {
					data.status = RssStatus.added;
				} else {
					data.status = RssStatus.none;
				}
				pageList.push(data);
				// }
			}
			this.pagesList = pageList;
			this.filesList = [];
			for (const file of filesList) {
				const record = this.getDownloadRecordByUrl(file.download_url);
				this.filesList.push({
					file,
					record,
					title: file.file
				});
			}
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

		async addDownloadRecord(info: FileInfo) {
			const record = await downloadFile(info);
			if (record) {
				const index = this.filesDownloadHistoryList.findIndex(
					(l) => l.id == record.id
				);
				if (index >= 0) {
					this.filesDownloadHistoryList.splice(index, 1, record);
				} else {
					binaryInsert<DownloadRecord>(
						this.filesDownloadHistoryList,
						record,
						CompareDownloadRecord
					);
				}
				const currentRecordIndex = this.filesList.findIndex(
					(file) =>
						(!file.record && file.file.download_url == record.url) ||
						(file.record && file.record.id == record.id)
				);
				if (currentRecordIndex >= 0) {
					this.filesList.splice(index, 1, {
						...this.filesList[currentRecordIndex],
						record
					});
				}
				this.startInterval();
			}
			return !!record;
		},

		startInterval() {
			if (this.queryTimer) {
				return;
			}
			const needQuery = (list: DownloadRecord[]) => {
				const downloading = list.filter(
					(item) =>
						item.status === DOWNLOAD_RECORD_STATUS.WAITING ||
						item.status === DOWNLOAD_RECORD_STATUS.DOWNLOADING
				);

				return downloading.length !== 0;
			};
			if (!needQuery(this.filesDownloadHistoryList)) {
				return;
			}
			this.queryTimer = setInterval(async () => {
				const list = await this.getDownloadHistory(
					0,
					this.filesDownloadHistoryList.length
				);
				if (!needQuery(list)) {
					clearInterval(this.queryTimer);
					this.queryTimer = null;
					console.log('clear');
					return;
				}
			}, 5000);
		},
		async getDownloadHistory(offset: number, limit: number) {
			const req = new DownloadRecordRequest(
				undefined,
				undefined,
				undefined,
				offset,
				limit
			);
			const list = await getDownloadHistory(req);
			if (list) {
				list.forEach((record) => {
					const index = this.filesDownloadHistoryList.findIndex(
						(l) => l.id == record.id
					);

					if (index >= 0) {
						this.filesDownloadHistoryList.splice(index, 1, record);
					} else {
						binaryInsert<DownloadRecord>(
							this.filesDownloadHistoryList,
							record,
							CompareDownloadRecord
						);
					}

					const currentRecordIndex = this.filesList.findIndex(
						(file) =>
							(!file.record && file.file.download_url == record.url) ||
							(file.record && file.record.id == record.id)
					);
					if (currentRecordIndex >= 0) {
						this.filesList.splice(index, 1, {
							...this.filesList[currentRecordIndex],
							record
						});
					}
				});
			}
			return list ? list : [];
		},
		getDownloadRecordByUrl(url: string) {
			const item = this.filesDownloadHistoryList.find((l) => l.url == url);
			return item;
		}
	}
});
