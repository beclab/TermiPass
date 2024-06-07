import { Utils } from 'src/extension/utils';
import {
	getWebsiteRSSHub as utilGetWebsiteRSSHub,
	getPageRSSHub as utilGetPageRSSHub
} from '../utils/radar';
import { defaultRules } from '../utils/radar-rules';
import { browser } from 'webextension-polyfill-ts';

export default class RssService {
	static initGlobalPageRss() {
		if (!Utils.global.pageRSS) {
			Utils.global.pageRSS = {};
		}
		if (!Utils.global.websiteRSSHub) {
			Utils.global.websiteRSSHub = {};
		}

		if (!Utils.global.pageRSSHub) {
			Utils.global.pageRSSHub = {};
		}
	}

	static handleRSS = async (feeds: any, tabId: any, useCache = false) => {
		this.initGlobalPageRss();

		if (
			useCache &&
			Utils.global.pageRSS &&
			Utils.global.pageRSS[tabId] &&
			Utils.global.pageRSS[tabId].length > 0
		) {
			return;
		}
		if (tabId) {
			try {
				const tab = await browser.tabs.get(tabId);
				if (feeds && feeds.length > 0) {
					feeds.forEach((feed: { image: any }) => {
						feed.image = tab.favIconUrl || feed.image;
					});

					Utils.global.pageRSS[tabId] =
						feeds.filter((feed: { uncertain: any }) => !feed.uncertain) || [];
				}

				if (tab && tab.url) {
					const websiteRssResult = this.getWebsiteRSSHub(tab.url);
					Utils.global.websiteRSSHub[tabId] = websiteRssResult || [];

					const info = await this.getPageRSSHub(tab.url, tabId);
					Utils.global.pageRSSHub[tabId] = info;
				}
			} catch (error) {
				console.error(error);
			}
		}
	};

	static getWebsiteRSSHub = (url: string | undefined) => {
		const result = utilGetWebsiteRSSHub({
			url,
			rules: defaultRules
		});

		return result;
	};

	static getPageRSSHub = async (url: string | undefined, tabId: number) => {
		let html = '';
		try {
			html = await browser.tabs.sendMessage(tabId, {
				text: 'getHTML'
			});
		} catch (error) {
			console.error(error);
		}

		const result = utilGetPageRSSHub({
			url,
			html,
			rules: defaultRules
		});

		return result;
	};

	static addPageRSS = async (feed: any, tabId: number) => {
		if (feed && tabId) {
			try {
				const tab = await browser.tabs.get(tabId);
				if (tab) {
					feed.image = tab.favIconUrl || feed.image;
					Utils.global.pageRSS[tabId].push(feed);
				}
			} catch (error) {
				console.error(error);
			}
		}
	};

	static getRSSById = (tabId: number) => {
		try {
			return {
				pageRSS: Utils.global.pageRSS[tabId] || {},
				websiteRSSHub: Utils.global.websiteRSSHub[tabId] || {},
				pageRSSHub: Utils.global.pageRSSHub[tabId] || {}
			};
		} catch (error) {
			return {
				pageRSS: {},
				websiteRSSHub: {},
				pageRSSHub: {}
			};
		}
	};

	static getAllRSS = () => {
		return {
			pageRSS: Utils.global.pageRSS,
			websiteRSSHub: Utils.global.websiteRSSHub,
			pageRSSHub: Utils.global.pageRSSHub
		};
	};

	static removeRSS(tabId: any) {
		this.initGlobalPageRss();
		delete Utils.global.pageRSS[tabId];
		delete Utils.global.websiteRSSHub[tabId];
		delete Utils.global.pageRSSHub[tabId];
	}
}
