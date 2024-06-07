/* eslint-disable @typescript-eslint/no-unused-vars */
// import { getExtensionBackgroundPlatform } from 'src/extension/background/extensionBackgroundPlatform';
// import {
// 	CONTEXT_MENUS_AUTOFILL_ID,
// 	CONTEXT_MENUS_LOCKED,
// 	updateDataContextMenu,
// 	updateLockedContextMenu
// } from '../../utils/menusMananger';
import { browser, Tabs, Menus, Runtime } from 'webextension-polyfill-ts';
// import AutofillPageDetails from '../autofill-page-details';
// import {
// 	UpdateBadgeInterface,
// 	ExtensionBadgeLevel
// } from '../../interface/updateBadgeInterface';
import { getActiveTab } from '../../utils';

import {
	ExtensionBadgeLevel,
	UpdateBadgeInterface
} from '../../interface/updateBadgeInterface';
import { BrowserInterface } from '../../interface/browserInterface';
import { ExtensionMessageMode } from '../../interface/message';
import { getExtensionBackgroundPlatform } from 'src/extension/background/extensionBackgroundPlatform';
import { CONTEXT_MENUS_LOCKED } from 'src/extension/utils/menusMananger';
import { AutofillExtensionMessage } from '../interface/message';

import AutofillService from '../services/autofill.service';
import OverlayBackground from './overlay.background';
// import { BrowserInterface } from '../../interface/browserInterface';
// import {
// 	ExtensionMessage,
// 	ExtensionMessageMode
// } from '../../interface/message';
// import OnRemovedRemoveInfoType = Tabs.OnRemovedRemoveInfoType;

export class AutofillBackground
	implements UpdateBadgeInterface, BrowserInterface
{
	messageModule: ExtensionMessageMode = 'autofill';
	autofillService = new AutofillService();
	overlayBackground = new OverlayBackground(this.autofillService);

	async init() {
		//Do Nothing
		await this.autofillService.init();
		await this.overlayBackground.init();
	}

	// async updateAutofillContextMenu(unlockedCallback: any) {
	// if (getExtensionBackgroundPlatform().dataCenter.isLocked()) {
	// 	await updateLockedContextMenu();
	// } else {
	// 	await updateDataContextMenu(await this._getItemsForTab());
	// 	unlockedCallback();
	// }
	// }

	// async doAutofillTab(tab: Tabs.Tab, info: Menus.OnClickData) {
	// 	if (!tab || !tab.id) {
	// 		throw new Error('Tab does not have an id, cannot complete autofill.');
	// 	}

	// 	const details = await this.collectPageDetails(tab.id);

	// 	const platform = getExtensionBackgroundPlatform();

	// 	const item = platform.dataCenter.findChildItem(info);

	// 	if (item) {
	// 		await autofillService.doAutoFill(
	// 			{
	// 				tab: tab,
	// 				pageDetails: [
	// 					{
	// 						frameId: 0,
	// 						tab: tab,
	// 						details: details
	// 					}
	// 				],
	// 				skipLastUsed: false,
	// 				skipUsernameOnlyFill: false,
	// 				onlyEmptyFields: false,
	// 				onlyVisibleFields: false,
	// 				fillNewPassword: true
	// 			},
	// 			item
	// 		);
	// 	} else {
	// 		throw new Error('item does not exist, cannot complete autofill.');
	// 	}
	// }

	// private async collectPageDetails(
	// 	tabId: number
	// ): Promise<AutofillPageDetails> {
	// 	return new Promise((resolve, reject) => {
	// 		//fix : by new Promise and response,return turn
	// 		//https://github.com/mozilla/webextension-polyfill/issues/130
	// 		browser.tabs
	// 			.sendMessage(tabId, {
	// 				command: 'collectPageDetailsImmediately'
	// 			})
	// 			.then((response) => {
	// 				resolve(response);
	// 			})
	// 			.catch((e) => {
	// 				reject(e);
	// 			});
	// 	});
	// }

	private async _getItemsForTab() {
		const tab = await getActiveTab();
		try {
			if (!tab || !tab.url) {
				return [];
			}
			const url = new URL(tab.url as string);
			return getExtensionBackgroundPlatform().dataCenter.getWebVaultItems(
				url.host
			);
		} catch (e) {
			return [];
		}
	}

	/************ UpdateBadgeInterface *************/

	priority = {
		level: ExtensionBadgeLevel.middle,
		num: 50
	};

	badgeUpdatable = async () => {
		const autofillBadge =
			await getExtensionBackgroundPlatform().getAutofillBadgeEnable();

		if (autofillBadge) {
			const items = await this._getItemsForTab();
			const tab = await getActiveTab();

			if (tab && tab.url) {
				const url = new URL(tab.url as string);
				return url.pathname.includes('login') && items.length > 0;
			}
		}
		return false;
	};

	updateBadge = async () => {
		const items = await this._getItemsForTab();
		await browser.action.setBadgeText({ text: items.length.toString() });
		await browser.action.setBadgeBackgroundColor({ color: '#099888' });
	};

	async contextMenusOnClicked(
		info: Menus.OnClickData,
		tab: Tabs.Tab | undefined
	) {
		if (tab == null || info == null) {
			return;
		}
		const platform = getExtensionBackgroundPlatform();
		if (
			platform.dataCenter.isLocked() ||
			info.menuItemId == CONTEXT_MENUS_LOCKED
		) {
			return;
		}

		// if (
		// 	!platform.dataCenter.isLocked() &&
		// 	(await platform.dataCenter.hasUser())
		// ) {
		// 	switch (info.parentMenuItemId) {
		// 		case CONTEXT_MENUS_AUTOFILL_ID:
		// 			try {
		// 				await this.doAutofillTab(tab, info);
		// 			} catch (error) {
		// 				console.error(error);
		// 			}
		// 			break;
		// 	}
		// }
	}

	runtimeOnConnect(_port: Runtime.Port) {
		//Do Nothing
	}

	async runtimeOnMessage(
		message: AutofillExtensionMessage,
		sender: Runtime.MessageSender
	) {
		switch (message.type) {
			case 'triggerAutofillScriptInjection':
				if (sender.tab) {
					await this.autofillService.injectAutofillScripts(
						sender.tab,
						sender.frameId
					);
				}
				break;
			case 'bgCollectPageDetails':
				await this.collectPageDetailsForContentScript(
					sender.tab,
					message.sender,
					sender.frameId
				);
				break;

			default:
				break;
		}
	}

	tabsOnRemoved(_tabId: number, _removeInfo: Tabs.OnRemovedRemoveInfoType) {
		//Do Nothing
	}

	async tabsOnUpdated(
		tabId: number,
		updateInfo: Tabs.OnUpdatedChangeInfoType,
		tab: Tabs.Tab
	) {
		const removePageDetailsStatus = new Set(['loading', 'unloaded']);
		if (updateInfo.status && removePageDetailsStatus.has(updateInfo.status)) {
			this.overlayBackground.removePageDetails(tabId);
		}
		if (!tab.active) {
			return;
		}
		await this.overlayBackground.updateOverlayCiphers();
	}

	async tabsOnActivated(_activeInfo: Tabs.OnActivatedActiveInfoType) {
		await this.updateCurrentTabData();
	}

	async getItemsForTab() {
		const tab = await getActiveTab();
		try {
			if (!tab || !tab.url) {
				return [];
			}
			const url = new URL(tab.url as string);
			return getExtensionBackgroundPlatform().dataCenter.getWebVaultItems(
				url.host
			);
		} catch (e) {
			return [];
		}
	}
	async collectPageDetailsForContentScript(
		tab: any,
		sender: string,
		frameId: number | null = null
	) {
		if (tab == null || !tab.id) {
			return;
		}

		const options: any = {};
		if (frameId != null) {
			options.frameId = frameId;
		}
		browser.tabs.sendMessage(tab.id, {
			command: 'collectPageDetails',
			tab,
			sender
		});
	}

	private updateCurrentTabData = async () => {
		await Promise.all([this.overlayBackground.updateOverlayCiphers()]);
	};
}

export default new AutofillBackground();
