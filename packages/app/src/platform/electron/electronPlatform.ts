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
				url: userStore.getModuleSever('files') + '/' + 'seahub',
				username: app.account?.name + '@seafile.com',
				authToken: userStore.current_user.access_token
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

		if (userStore.needUnlockFirst) {
			redirect({ path: '/unlock' });
			return;
		}
		if (!userStore.current_user) {
			redirect({ path: '/import_mnemonic' });
			return;
		}
		redirect({ path: '/connectLoading' });
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
