import { MobileWebPlatform } from '../../terminusCommon/mobileWebPlatform';
import { ExtensionStorage, ExtensionUserStorage } from '../storage';
import { useUserStore } from '../../../stores/user';
import {
	UserItem,
	getPlatform as defaultGetPlatform
} from '@didvault/sdk/src/core';
import { app, setSenderUrl } from '../../../globals';
import { walletService } from '../../../wallet';
import PortMessage from '../../../extension/utils/message/portMessage';
import { useBexStore } from '../../../stores/bex';
import { AppState } from '@didvault/sdk/src/core/app';
import { bexFrontBusOn } from '../utils';
import { unlockByPwd } from 'src/pages/Mobile/login/unlock/UnlockBusiness';
import { busOn } from 'src/utils/bus';
import { sendExtensionMessage } from 'src/extension/autofill2/utils/sendMessage';

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

		bexFrontBusOn(
			'UNLOCKED_UPDATE',
			async (params: { status: boolean; password?: string }) => {
				const userStore = useUserStore();

				if (userStore.users?.locked != params.status) {
					return;
				}
				if (!this.router) {
					return;
				}
				if (!params.status) {
					await app.lock();
					return;
				}
				if (!params.password) {
					return;
				}

				const router = this.router;

				unlockByPwd(params.password, {
					async onSuccess(data: any) {
						if (data) {
							if (userStore.current_user) {
								if (userStore.current_user.name) {
									router.replace('/connectLoading');
								} else {
									router.replace('/bind_vc');
								}
							}
						} else {
							router.replace({ path: '/import_mnemonic' });
						}
					},
					onFailure(message: string) {
						// notifyFailed(message);
						console.log(message);
					}
				});
			}
		);
		busOn('updateVaultComplete', () => {
			sendExtensionMessage('updateVaultComplete', {});
		});
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
		if (userStore.users?.locked) {
			redirect({ path: '/unlock' });
			return;
		}

		if (userStore.current_id) {
			const user: UserItem = userStore.users!.items.get(userStore.current_id!)!;
			if (user.setup_finished) {
				setSenderUrl({
					url: user.vault_url
				});
			}

			await app.load(userStore.current_id!);
			await app.unlock(user.mnemonic);

			redirect({ path: '/home' });
		} else {
			redirect({ name: 'setupSuccess' });
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
