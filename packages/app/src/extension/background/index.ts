import { walletService } from '../../wallet';
import { AjaxSender } from '@didvault/sdk/src/ajax';
import { setPlatform } from '@didvault/sdk/src/core';
import { App } from '@didvault/sdk/src/core/app';
import { debounce, getActiveTab } from '../utils';

import { ExtensionBackgroundPlatform } from './extensionBackgroundPlatform';
import { browser } from 'webextension-polyfill-ts';

import { UpdateBadgeInterface } from '../interface/updateBadgeInterface';
import PortMessage from '../utils/message/portMessage';
import Controller from './controller';
import { busOn, busOff, busEmit } from 'src/utils/bus';
import { rssBackground, autofillBackground, providerBackground } from './utils';
import { BrowserInterface } from '../interface/browserInterface';
import { ExtensionMessage } from '../interface/message';
import { AuthService } from '../services/auth.service';

export class ExtensionBackground {
	app = new App(new AjaxSender(process.env.PL_SERVER_URL!));
	private _platform = new ExtensionBackgroundPlatform();

	backgroundBrowserInterfaceList: BrowserInterface[] = [];
	backgroundBadgeInterfaceList: UpdateBadgeInterface[] = [];

	authService = new AuthService();

	async init() {
		globalThis.webos_app_plugin_id = chrome.runtime.id;
		walletService.load();
		setPlatform(new ExtensionBackgroundPlatform());

		const update = debounce((options: any) => this.update(options), 500);

		rssBackground.init();
		autofillBackground.init(this.authService);
		providerBackground.init();

		this.backgroundBrowserInterfaceList = [
			rssBackground,
			autofillBackground,
			providerBackground
		];

		this.backgroundBadgeInterfaceList = [
			rssBackground,
			autofillBackground,
			providerBackground
		];

		browser.runtime.onConnect.addListener((port) => {
			if (
				port.name === 'popup' ||
				port.name === 'notification' ||
				port.name === 'tab'
			) {
				const pm = new PortMessage(port);
				pm.listen((data: any) => {
					//前台传过来消息通过event发送
					if (data.type === 'broadcast') {
						busEmit(data.method, data.params);
					} else if (data.type === 'controller') {
						if (data.method) {
							return Controller[data.method].apply(null, data.params);
						}
					}
				});

				/**
				 * 接收发送到前台消息 回调pm进行request
				 */
				const broadcastCallback = (data) => {
					pm.request({
						type: 'broadcast',
						method: data.method,
						params: data.params
					});
				};
				busOn('BROADCAST_TO_UI', broadcastCallback);

				//断开连接
				port.onDisconnect.addListener(() => {
					busOff('BROADCAST_TO_UI', broadcastCallback);
				});
				return;
			}

			this.backgroundBrowserInterfaceList.forEach((bg) => {
				bg.runtimeOnConnect(port);
			});
		});

		browser.runtime.onMessage.addListener(
			async (msg: ExtensionMessage, sender) => {
				this.backgroundBrowserInterfaceList.forEach((bg) => {
					if (msg.module == bg.messageModule) {
						bg.runtimeOnMessage(msg, sender);
					}
				});
			}
		);

		browser.contextMenus.onClicked.addListener(async (info, tab) => {
			this.backgroundBrowserInterfaceList.forEach((bg) => {
				bg.contextMenusOnClicked(info, tab);
			});
		});

		browser.action.onClicked.addListener(async () => {
			const activeTab = await getActiveTab();
			if (!activeTab) {
				return;
			}
			browser.tabs.sendMessage(activeTab.id!, {
				url: activeTab.url,
				type: 'toggle-slider'
			});
		});

		// browser.windows.onFocusChanged()

		browser.tabs.onRemoved.addListener((tabId, removeInfo) => {
			this.backgroundBrowserInterfaceList.forEach((bg) => {
				bg.tabsOnRemoved(tabId, removeInfo);
			});
		});

		browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
			this.backgroundBrowserInterfaceList.forEach((bg) => {
				bg.tabsOnUpdated(tabId, changeInfo, tab);
			});
			update({
				tabId,
				changeInfo
			});
		});

		browser.tabs.onActivated.addListener((info) => {
			this.backgroundBrowserInterfaceList.forEach((bg) => {
				bg.tabsOnActivated(info);
			});
			update(info);
		});

		await this.app.load(undefined);

		chrome.alarms.onAlarm.addListener((name) => {
			if (name.name === 'TERMIPASS_SERVER_WORKER_KEEP_ALIVE') {
				this.createKeepAliveAlarm();
			}
		});

		this.createKeepAliveAlarm();
	}

	// keep sw alive
	createKeepAliveAlarm = async () => {
		await chrome.alarms.clearAll();
		chrome.alarms.create('TERMIPASS_SERVER_WORKER_KEEP_ALIVE', {
			when: Date.now() + 20000
		});
	};

	async update(options: any) {
		await autofillBackground.updateAutofillContextMenu();
		await rssBackground.handleRSS(options);
		await this._updateBadge();
	}

	private async _updateBadge() {
		const extensionBadge = await this._platform.dataCenter.getExtensionBadge();

		if (!extensionBadge) {
			await browser.action.setBadgeText({ text: '' });
			return;
		}

		let badge: UpdateBadgeInterface | undefined = undefined;

		for (
			let index = 0;
			index < this.backgroundBadgeInterfaceList.length;
			index++
		) {
			const element = this.backgroundBadgeInterfaceList[
				index
			] as UpdateBadgeInterface;
			const updatable = await element.badgeUpdatable();
			if (!updatable) {
				continue;
			}

			if (badge) {
				const levelLow = badge.priority.level < element.priority.level;
				const numLow =
					badge.priority.level === element.priority.level &&
					badge.priority.num <= element.priority.num;
				if (levelLow || numLow) {
					badge = element;
				}
			} else {
				badge = element;
			}
		}

		if (badge) {
			await badge.updateBadge();
		} else {
			await browser.action.setBadgeText({ text: '' });
		}
	}
}

export default new ExtensionBackground();
