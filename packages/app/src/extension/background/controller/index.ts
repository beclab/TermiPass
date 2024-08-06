import {
	notificationService,
	permissionService,
	sessionService
} from '../../provider/service';
import { getExtensionBackgroundPlatform } from '../extensionBackgroundPlatform';
import RssService from '../../rss/service';
import { default as background } from '../index';
import { providerBackground } from '../utils';
import storage from '../../provider/storage/storage';
import { getActiveTab } from '../../utils';
import { browser } from 'webextension-polyfill-ts';
import { busEmit } from 'src/utils/bus';

export class Controller {
	/**
	 * approval
	 */

	getApproval = notificationService.getApproval;

	resolveApproval = notificationService.resolveApproval;

	rejectApproval = async (err?: string, isInternal = false) => {
		console.log('controller rejectApproval');

		return await notificationService.rejectApproval(err, isInternal);
	};

	/**
	 * rss
	 */

	getAllRSSList = async (tabId: number) => {
		const result = RssService.getRSSById(tabId);
		let pageRSSHub = [],
			pageRSS = [];
		if (result && result.pageRSS && result.pageRSS.length > 0) {
			pageRSS = result.pageRSS;
		}
		if (result && result.pageRSSHub && result.pageRSSHub.length > 0) {
			pageRSSHub = result.pageRSSHub;
		}
		return { pageRSSHub, pageRSS };
	};

	/**
	 * provider
	 */

	sendUnlocked = (data: string) => {
		getExtensionBackgroundPlatform().dataCenter.unlock(data);
		providerBackground.setUnlock(true);
	};

	sendLocked = () => {
		getExtensionBackgroundPlatform().dataCenter.lock();
		background.update(undefined);
		providerBackground.setUnlock(false);
	};

	sendAppState = async (
		appState: string,
		accountsData: string,
		mnemonicsData: string,
		currentAccountId: string
	) => {
		const dataCenter = getExtensionBackgroundPlatform().dataCenter;
		dataCenter.clearData();
		await dataCenter.decryptAppState(appState);
		await dataCenter.decryptUserItems(
			accountsData,
			mnemonicsData,
			currentAccountId
		);
		await dataCenter.setUser(currentAccountId);
		if (dataCenter.isLocked()) {
			dataCenter.clearData();
		}
		await background.update(undefined);
	};

	requestPassword = () => {
		return getExtensionBackgroundPlatform().dataCenter.encryptPassword();
	};

	getConnectedSite = async () => {
		return permissionService.getConnectedSites();
	};

	removeConnectedSite = async (origin: string) => {
		sessionService.broadcastEvent('disconnect', '', origin);
		permissionService.removeConnectedSite(origin);
	};

	removeConnectedSites = async () => {
		sessionService.broadcastEvent('disconnect');
		permissionService.clear();
	};

	changeAccount = (didKey: string) => {
		sessionService.broadcastEvent('accountChanged', didKey);
	};

	/**
	 * setting
	 */

	setAutofillBadgeEnable = async (enable: boolean) => {
		return await getExtensionBackgroundPlatform().setAutofillBadgeEnable(
			enable
		);
	};

	getAutofillBadgeEnable = async (): Promise<boolean> => {
		return await getExtensionBackgroundPlatform().getAutofillBadgeEnable();
	};

	setRssBadgeEnable = async (enable: boolean) => {
		return await getExtensionBackgroundPlatform().setRssBadgeEnable(enable);
	};

	getRssBadgeEnable = async (): Promise<boolean> => {
		return await getExtensionBackgroundPlatform().getRssBadgeEnable();
	};

	setApprovalBadgeEnable = async (enable: boolean) => {
		return await getExtensionBackgroundPlatform().setApprovalBadgeEnable(
			enable
		);
	};

	getApprovalBadgeEnable = async (): Promise<boolean> => {
		return await getExtensionBackgroundPlatform().getApprovalBadgeEnable();
	};

	//extension store

	storeGetItem = async (key: string): Promise<any> => {
		return await storage.get(key, undefined);
	};

	storeSetItem = async (key: string, value: any) => {
		return await storage.set(key, value);
	};

	storeRemoveItem = async (key: string) => {
		return await storage.remove(key);
	};

	// extension tab
	getCurrentTab = async () => {
		return await getActiveTab();
	};

	//
	toggleBexDisplay = async () => {
		const activeTab = await getActiveTab();
		if (!activeTab) {
			return;
		}
		browser.tabs.sendMessage(activeTab.id!, {
			url: activeTab.url,
			type: 'toggle-slider'
		});
	};

	autofillById = async (id: string) => {
		busEmit('autofillById', id);
	};
}

export default new Controller();
