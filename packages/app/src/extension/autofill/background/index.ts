/* eslint-disable @typescript-eslint/no-unused-vars */
import { getExtensionBackgroundPlatform } from 'src/extension/background/extensionBackgroundPlatform';
import {
	CONTEXT_MENUS_AUTOFILL_ID,
	CONTEXT_MENUS_LOCKED,
	updateDataContextMenu,
	updateLockedContextMenu
} from '../../utils/menusMananger';
import { browser, Tabs, Menus, Runtime } from 'webextension-polyfill-ts';
import AutofillPageDetails from '../autofill-page-details';
import {
	UpdateBadgeInterface,
	ExtensionBadgeLevel
} from '../../interface/updateBadgeInterface';
import { getActiveTab } from '../../utils';

import AutofillService from '../autofillService';
import { BrowserInterface } from '../../interface/browserInterface';
import {
	ExtensionMessage,
	ExtensionMessageMode
} from '../../interface/message';
import OnRemovedRemoveInfoType = Tabs.OnRemovedRemoveInfoType;

const autofillService: AutofillService = new AutofillService();

export class AutofillBackground
	implements UpdateBadgeInterface, BrowserInterface
{
	messageModule: ExtensionMessageMode = 'autofill';

	async init() {
		//Do Nothing
	}

	async updateAutofillContextMenu() {
		if (getExtensionBackgroundPlatform().dataCenter.isLocked()) {
			await updateLockedContextMenu();
		} else {
			await updateDataContextMenu(await this._getItemsForTab());
			// unlockedCallback();
		}
	}

	async doAutofillTab(tab: Tabs.Tab, info: Menus.OnClickData) {
		if (!tab || !tab.id) {
			throw new Error('Tab does not have an id, cannot complete autofill.');
		}

		const details = await this.collectPageDetails(tab.id);
		console.log('details ===>');
		console.log(details);

		const platform = getExtensionBackgroundPlatform();

		const item = platform.dataCenter.findChildItem(info);

		if (item) {
			await autofillService.doAutoFill(
				{
					tab: tab,
					pageDetails: [
						{
							frameId: 0,
							tab: tab,
							details: details
						}
					],
					skipLastUsed: false,
					skipUsernameOnlyFill: false,
					onlyEmptyFields: false,
					onlyVisibleFields: false,
					fillNewPassword: true
				},
				item
			);
		} else {
			throw new Error('item does not exist, cannot complete autofill.');
		}
	}

	private async collectPageDetails(
		tabId: number
	): Promise<AutofillPageDetails> {
		return new Promise((resolve, reject) => {
			//fix : by new Promise and response,return turn
			//https://github.com/mozilla/webextension-polyfill/issues/130
			browser.tabs
				.sendMessage(tabId, {
					command: 'collectPageDetailsImmediately'
				})
				.then((response) => {
					resolve(response);
				})
				.catch((e) => {
					reject(e);
				});
		});
	}

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

		if (
			!platform.dataCenter.isLocked() &&
			(await platform.dataCenter.hasUser())
		) {
			switch (info.parentMenuItemId) {
				case CONTEXT_MENUS_AUTOFILL_ID:
					try {
						await this.doAutofillTab(tab, info);
					} catch (error) {
						console.error(error);
					}
					break;
			}
		}
	}

	runtimeOnConnect(_port: Runtime.Port) {
		//Do Nothing
	}

	runtimeOnMessage(_message: ExtensionMessage, _sender: Runtime.MessageSender) {
		//Do Nothing
	}

	tabsOnRemoved(_tabId: number, _removeInfo: OnRemovedRemoveInfoType) {
		//Do Nothing
	}

	tabsOnUpdated(_tabId: number, _updateInfo: Tabs.OnUpdatedChangeInfoType) {}

	tabsOnActivated(_activeInfo: Tabs.OnActivatedActiveInfoType) {}
}

export default new AutofillBackground();
