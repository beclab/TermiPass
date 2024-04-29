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
import { Message } from '../rss/utils';
import { BrowserInterface } from '../interface/browserInterface';

export class ExtensionBackground {
	app = new App(new AjaxSender(process.env.PL_SERVER_URL!));
	private _platform = new ExtensionBackgroundPlatform();

	backgroundList: UpdateBadgeInterface[] | BrowserInterface[] = [];

	async init() {
		globalThis.webos_app_plugin_id = chrome.runtime.id;
		walletService.load();
		setPlatform(new ExtensionBackgroundPlatform());

		const update = debounce((options: any) => this.update(options), 500);

		rssBackground.init();
		autofillBackground.init();
		providerBackground.init();

		this.backgroundList = [
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

			this.backgroundList.forEach((bg) => {
				bg.runtimeOnConnect(port);
			});
		});

		browser.runtime.onMessage.addListener(async (msg: Message, sender) => {
			this.backgroundList.forEach((bg) => {
				bg.runtimeOnMessage(msg, sender);
			});
		});

		browser.contextMenus.onClicked.addListener(async (info, tab) => {
			this.backgroundList.forEach((bg) => {
				bg.contextMenusOnClicked(info, tab);
			});
		});

		browser.action.onClicked.addListener(async (info, tab) => {
			console.log(222);
			console.log(info);
			console.log(tab);

			const activeTab = await getActiveTab();
			if (!activeTab) {
				return;
			}
			console.log(activeTab);

			browser.tabs.sendMessage(activeTab.id!, {
				url: activeTab.url,
				type: 'toggle-slider'
			});
		});

		browser.tabs.onRemoved.addListener((tabId, removeInfo) => {
			this.backgroundList.forEach((bg) => {
				bg.tabsOnRemoved(tabId, removeInfo);
			});
		});

		browser.tabs.onUpdated.addListener(update);

		browser.tabs.onActivated.addListener(update);

		await this.app.load(undefined);

		chrome.alarms.onAlarm.addListener((name) => {
			console.log('browser.alarms.onAlarm ===> ' + name.name);
			if (name.name === 'TERMIPASS_SERVER_WORKER_KEEP_ALIVE') {
				console.log(
					'borwser alarms TERMIPASS_SERVER_WORKER_KEEP_ALIVE success'
				);
				this.createKeepAliveAlarm();
			}
		});

		this.createKeepAliveAlarm();
	}

	// keep sw alive
	createKeepAliveAlarm = async () => {
		console.log('createKeepAliveAlarm start');
		await chrome.alarms.clearAll();

		const alarm = await chrome.alarms.get('TERMIPASS_SERVER_WORKER_KEEP_ALIVE');
		console.log(alarm);

		chrome.alarms.create('TERMIPASS_SERVER_WORKER_KEEP_ALIVE', {
			when: Date.now() + 20000
		});

		const alarm2 = await chrome.alarms.get(
			'TERMIPASS_SERVER_WORKER_KEEP_ALIVE'
		);
		console.log(alarm2);
	};

	async update(options: any) {
		await autofillBackground.updateAutofillContextMenu(async () => {
			// await addDownloadMenu();
		});

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

		for (let index = 0; index < this.backgroundList.length; index++) {
			const element = this.backgroundList[index] as UpdateBadgeInterface;
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
