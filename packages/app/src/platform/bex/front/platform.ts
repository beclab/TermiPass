import { MobileWebPlatform } from '../../terminusCommon/mobileWebPlatform';
import { ExtensionStorage, ExtensionUserStorage } from '../storage';
// import { browser } from 'webextension-polyfill-ts';
import { useUserStore } from '../../../stores/user';
import { getPlatform as defaultGetPlatform } from '@didvault/sdk/src/core';
import { walletService } from '../../../wallet';
import PortMessage from '../../../extension/utils/message/portMessage';
import { useBexStore } from '../../../stores/bex';
import { AppState } from '@didvault/sdk/src/core/app';

export interface ExtensionPlatformInterface {
	portMessage: PortMessage;
}

export const getExtensionPlatform = () => {
	return defaultGetPlatform() as ExtensionPlatform;
};

export class ExtensionPlatform
	extends MobileWebPlatform
	implements ExtensionPlatformInterface
{
	/*** ExtensionPlatformInterface */

	portMessage: PortMessage = new PortMessage();

	storage = new ExtensionStorage();

	userStorage = new ExtensionUserStorage();

	/**
	 * AppPlatform
	 */

	async appMounted(): Promise<void> {
		super.appMounted();
	}

	async appRedirectUrl(redirect: any, currentRoute: any): Promise<void> {
		const chromeExtensionDesign = currentRoute.path.split('/')[1];
		await walletService.load();
		const userStore = useUserStore();
		if (chromeExtensionDesign === 'inject') {
			return;
		}
		if (!userStore.isBooted) {
			redirect({ path: '/welcome' });
			return;
		}

		if (userStore.needUnlockFirst) {
			redirect({ path: '/unlock' });
			return;
		}

		if (userStore.current_id) {
			redirect({ path: '/connectLoading' });
		} else {
			redirect({ path: '/import_mnemonic' });
		}
	}

	tabbarItems = [
		{
			name: 'Vault',
			identify: 'secret',
			normalImage: 'tab_secret_normal',
			activeImage: 'tab_secret_active',
			to: '/secret'
		},
		{
			name: 'Setting',
			identify: 'setting',
			normalImage: 'tab_setting_normal',
			activeImage: 'tab_setting_active',
			to: '/setting'
		}
	];

	async getDeviceInfo() {
		const info = await super.getDeviceInfo();
		info.description = `${info.browser} extension on ${info.platform}`;
		info.runtime = 'extension';
		return info;
	}

	async getCurrentTab(): Promise<any> {
		// const tabs = await browser.tabs.query({
		// 	active: true,
		// 	currentWindow: true
		// });
		// return tabs[0];
		const bexStore = useBexStore();
		return await bexStore.controller.getCurrentTab();
	}

	async setClipboard(val: string): Promise<void> {
		return new Promise((resolve, reject) => {
			navigator.clipboard.writeText(val).then(resolve).catch(reject);
		});
	}

	async getClipboard(): Promise<string> {
		return new Promise((resolve, reject) => {
			navigator.clipboard
				.readText()
				.then(function (clipboardData) {
					resolve(clipboardData);
				})
				.catch(function (error) {
					reject(error);
				});
		});
	}

	reconfigAppStateDefaultValue(appState: AppState) {
		appState.settings.autoLockDelay = 24 * 60;
		appState.settings.syncInterval = 5;
	}
}
