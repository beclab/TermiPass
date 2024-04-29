/* eslint-disable @typescript-eslint/no-unused-vars */
import { browser, Menus, Runtime, Tabs } from 'webextension-polyfill-ts';
import RssService from '../service';
import {
	UpdateBadgeInterface,
	ExtensionBadgeLevel
} from '../../interface/updateBadgeInterface';
import { getActiveTab } from '../../utils';
import { getExtensionBackgroundPlatform } from '../../background/extensionBackgroundPlatform';
import { BrowserInterface } from '../../interface/browserInterface';

export class RssBackground implements UpdateBadgeInterface, BrowserInterface {
	async init() {
		//Do Nothing
	}

	handleRSS = async (options: any) => {
		if (
			options &&
			(typeof options === 'number' || typeof options.tabId === 'number')
		) {
			const tabid =
				typeof options === 'number'
					? options
					: typeof options.tabId === 'number'
					? options.tabId
					: -1;
			if (tabid > 0) {
				let feeds = [];
				try {
					feeds = await browser.tabs.sendMessage(tabid, {
						text: 'getPageRSS'
					});
				} catch (error) {
					console.error(error);
				}
				await RssService.handleRSS(feeds, tabid);
			}
		}
	};

	/************ UpdateBadgeInterface *************/

	priority = {
		level: ExtensionBadgeLevel.low,
		num: 50
	};

	_getRssServiceInfo = async () => {
		const tab = await getActiveTab();
		const pageRss = RssService.getAllRSS().pageRSS;
		const pageRSSHub = RssService.getAllRSS().pageRSSHub;
		return { tab, pageRss, pageRSSHub };
	};

	badgeUpdatable = async () => {
		const rssBadge = await getExtensionBackgroundPlatform().getRssBadgeEnable();
		if (rssBadge) {
			const { tab, pageRss, pageRSSHub } = await this._getRssServiceInfo();

			if (
				tab &&
				tab.id &&
				pageRss &&
				pageRSSHub &&
				(pageRss[tab.id] != undefined || pageRSSHub[tab.id] != undefined)
			) {
				const pageRssItems = pageRss[tab.id] || [];
				const pageRSSHubItems = pageRSSHub[tab.id] || [];
				return pageRssItems.length + pageRSSHubItems.length > 0;
			}
		}

		return false;
	};

	updateBadge = async () => {
		const { tab, pageRss, pageRSSHub } = await this._getRssServiceInfo();
		if (
			tab &&
			tab.id &&
			pageRss &&
			pageRSSHub &&
			(pageRss[tab.id] != undefined || pageRSSHub[tab.id] != undefined)
		) {
			const pageRssItems = pageRss[tab.id] || [];
			const pageRSSHubItems = pageRSSHub[tab.id] || [];
			await browser.action.setBadgeBackgroundColor({ color: '#F62800' });
			await browser.action.setBadgeText({
				text: (pageRssItems.length + pageRSSHubItems.length).toString()
			});
		}
	};

	contextMenusOnClicked(_info: Menus.OnClickData, _tab: Tabs.Tab | undefined) {
		//DoNothing
	}

	runtimeOnConnect(_port: Runtime.Port) {
		//DoNothing
	}

	runtimeOnMessage(message: any, sender: Runtime.MessageSender) {
		switch (message.type) {
			case 'setPageRSS':
				if (sender.tab && sender.tab.active) {
					RssService.handleRSS(message.feeds, sender.tab.id, undefined);
				}
				break;
			case 'addPageRSS':
				if (sender.tab && sender.tab.active) {
					RssService.addPageRSS(message.feed, sender.tab.id!);
				}
				break;
		}
	}

	tabsOnRemoved(tabId: number) {
		RssService.removeRSS(tabId);
	}
}

export default new RssBackground();
