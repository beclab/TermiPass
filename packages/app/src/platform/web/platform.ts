import { SubAppPlatform } from '../subAppPlatform';

import { app } from '../../globals';
import { useUserStore } from '../../stores/user';
import {
	homeMounted as commonHomeMounted,
	homeUnMounted as commonHomeUnMounted
} from '../homeLayoutCommon';
import {
	AuthPurpose,
	AuthType,
	DeviceInfo,
	Err,
	ErrorCode,
	getPlatform as defaultGetPlatform
} from '@didvault/sdk/src/core';
import axios from 'axios';
import { TerminusInfo } from '@bytetrade/core';
import { useMenuStore } from 'src/stores/menu';
import { Router } from 'vue-router';
import TerminusDesktopTipDialog from '../../components/dialog/TerminusDesktopTipDialog.vue';

import { QVueGlobals } from 'quasar';
import { i18n } from '../../boot/i18n';
import { _authenticate } from '@didvault/sdk/src/authenticate';
import { busOff, busOn } from 'src/utils/bus';

export const getWebPlatform = () => {
	return defaultGetPlatform() as WebPlatform;
};

export class WebPlatform extends SubAppPlatform {
	router: Router | undefined;
	quasar: QVueGlobals | undefined;
	// deal more dialog
	dealInvalidSession = false;

	async appLoadPrepare(data: any): Promise<void> {
		super.appLoadPrepare(data);
		console.log('data ===>');
		console.log(data);

		if (data.router) {
			this.router = data.router;
		}

		if (data.quasar) {
			this.quasar = data.quasar;
		}

		app.load(undefined);
	}
	async appMounted(): Promise<void> {
		super.appMounted();
		//window.addEventListener('load', onload);
	}
	async appUnMounted(): Promise<void> {
		super.appUnMounted();
		//window.removeEventListener('load', onload);
	}

	async appRedirectUrl(redirect: any): Promise<void> {
		const userStore = useUserStore();
		return this.getTerminusInfo()
			.then((data) => {
				console.log('userStore', userStore.isBooted);
				if (data.terminusName && data.wizardStatus == 'completed') {
					return userStore.load().then(() => {
						userStore.currentUserSaveTerminusInfo(data);
						if (userStore.isBooted) {
							redirect({ path: '/unlock' });
						} else {
							redirect({ path: '/setUnlockPassword' });
						}
					});
				} else {
					userStore.currentUserSaveTerminusInfo(data);
					redirect({ path: '/binding' });
				}
			})
			.catch(() => {
				redirect({ path: '/error' });
			});
	}

	stateUpdate() {
		const menuStore = useMenuStore();
		menuStore.updateMenuInfo();

		const userStore = useUserStore();

		if (app.state._errors.length > 0) {
			const INVALID_SESSION = app.state._errors.find(
				(e) => e.code == ErrorCode.INVALID_SESSION
			)
				? true
				: false;

			if (INVALID_SESSION && !getWebPlatform().dealInvalidSession) {
				getWebPlatform().dealInvalidSession = true;
				getWebPlatform()
					.quasar?.dialog({
						component: TerminusDesktopTipDialog,
						componentProps: {
							title: i18n.global.t('reconnect_terminus'),
							message: i18n.global.t('reconnect_terminus_message'),
							confirmBtnTitle: i18n.global.t('ok'),
							cancelBtnTitle: i18n.global.t('cancel'),
							showCancel: true
						}
					})
					.onOk(async () => {
						getWebPlatform().quasar?.loading.show();
						try {
							await app.clearSession();
							console.log('app.vault ===>');
							console.log(app.state.vaults);

							// await app.unlock(userStore.current_user!.mnemonic);

							const authRes = await _authenticate({
								did: userStore.current_user!.local_name,
								type: AuthType.SSI,
								purpose: AuthPurpose.Login
							});
							if (authRes == null) {
								throw new Err(
									ErrorCode.AUTHENTICATION_FAILED,
									i18n.global.t('errors.authentication_failed')
								);
							}
							await app.login({
								did: authRes.did,
								password: userStore.current_user!.mnemonic,
								authToken: authRes.token
							});
						} catch (e) {
							console.log(e);
						} finally {
							getWebPlatform().quasar?.loading.hide();
						}
					})
					.onDismiss(() => {
						getWebPlatform().dealInvalidSession = false;
					});
			}
			app.state._errors = [];
		}

		if (app.state.locked) {
			getWebPlatform().router?.push({
				path: '/unlock'
			});
		}
	}

	async homeMounted(): Promise<void> {
		commonHomeMounted();
		busOn('appSubscribe', this.stateUpdate);
	}

	async homeUnMounted(): Promise<void> {
		commonHomeUnMounted();
		busOff('appSubscribe', this.stateUpdate);
	}

	async getDeviceInfo(): Promise<DeviceInfo> {
		const userStore = useUserStore();
		const info = await super.getDeviceInfo();
		if (userStore.locale) {
			info.locale = userStore.locale;
		}
		return info;
	}

	private async getTerminusInfo(
		terminus_url: string | null = null
	): Promise<TerminusInfo> {
		let baseUrl = terminus_url || window.location.origin;

		if (process.env.NODE_ENV === 'development') {
			baseUrl = '';
		}

		const data: any = await axios.get(baseUrl + '/bfl/info/v1/terminus-info');

		return data;
	}
}
