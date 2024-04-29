import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { TerminusCommonPlatform } from '../terminusCommon/terminalCommonPlatform';
import { useUserStore } from '../../stores/user';
import { useTransferStore } from 'src/stores/transfer';
import { useMenuStore } from 'src/stores/files-menu';
import { busOn } from 'src/utils/bus';
import { app } from 'src/globals';
import { AppState } from '@didvault/sdk/src/core/app';

export class ElectronPlatform extends TerminusCommonPlatform {
	async appLoadPrepare(data: any): Promise<void> {
		await super.appLoadPrepare(data);
		if (data.quasar) {
			GoogleAuth.initialize({
				clientId:
					'343424174381-cprm1j3a6da1bbprra97oc34lap3j0mp.apps.googleusercontent.com',
				grantOfflineAccess: true,
				scopes: ['profile', 'email']
			});
		}

		const transferStore = useTransferStore();

		transferStore.addTransferEventListener();

		const menuStore = useMenuStore();
		menuStore.getSyncStatus();

		const userStore = useUserStore();

		busOn('account_update', async (forceReload) => {
			if (!userStore.current_user?.setup_finished) {
				return;
			}

			if (!this.quasar?.platform.is.electron) {
				return;
			}

			const currentAccount = {
				url: userStore.getModuleSever('seafile'),
				username: app.account?.name + '@seafile.com'
			};

			if (forceReload) {
				await window.electron.api.files.removeCurrentAccount(currentAccount);
			}

			window.electron.api.files.loginAccount(currentAccount);
		});
	}

	async appRedirectUrl(redirect: any): Promise<void> {
		const userStore = useUserStore();
		await userStore.load();
		if (!userStore.isBooted) {
			redirect({ path: '/welcome' });
			return;
		}
		redirect({ path: '/unlock' });
	}

	async getDeviceInfo() {
		const superDeviceInfo = await super.getDeviceInfo();
		if (window.electron) {
			const appInfo = await window.electron.api.settings.getAppInfo();
			superDeviceInfo.appVersion = appInfo.version;
		} else {
			superDeviceInfo.appVersion = '0.0.1';
		}

		return superDeviceInfo;
	}

	isDesktop = true;

	reconfigAppStateDefaultValue(appState: AppState) {
		appState.settings.autoLockDelay = 24 * 60;
		appState.settings.syncInterval = 5;
	}
}
