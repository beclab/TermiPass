import { PushNotificationSchema } from '@capacitor/push-notifications';
import { IOSStorage, IOSUserStorage } from './storage';
import { FCM } from '@capacitor-community/fcm';
import { CapacitorPlatform } from '../capacitorPlatform';
import iOSPlugins from './iOSRegisterPlugins';
import { busOn, busOff, busEmit } from '../../../utils/bus';
import { updateUIToAddWeb } from '../addItem';
import { FieldType, VaultItem } from '@didvault/sdk/src/core';
import { app } from 'src/globals';
import { addAxiosProxyGlobalRequestInterceptor } from '../../httpProxy';
import AllowCrossWebsiteDialog from '../../../components/ios/AllowCrossWebsiteDialog.vue';
import { i18n } from '../../../boot/i18n';

export class IOSMobilePlatform extends CapacitorPlatform {
	//
	userStorage = new IOSUserStorage();
	storage = new IOSStorage();

	async appMounted(): Promise<void> {
		await super.appMounted();
		addAxiosProxyGlobalRequestInterceptor((config) => {
			//
			if (config.data instanceof FormData) {
				if (
					config.headers &&
					config.headers['Content-Type'] === 'application/x-www-form-urlencoded'
				) {
					const keyValues = {} as any;
					for (const [key, value] of config.data as any) {
						keyValues[key] = value;
					}
					config.data = keyValues;
				}
			}

			return config;
		});
	}

	getFCMToken(): Promise<{ token: string }> {
		return FCM.getToken();
	}

	async pushNotificationReceived(
		notification: PushNotificationSchema
	): Promise<void> {
		if (notification.data && notification.data['message']) {
			const body: string = notification.data['message'];
			busEmit('receiveMessage', body);
		}
	}

	async homeMounted(): Promise<void> {
		super.homeMounted();

		const iOSAutofill = await iOSPlugins.iOSAutofillPlugin.getAutofillList();

		if (iOSAutofill.list.length > 0) {
			this.iOSAppUrlOpen({ url: iOSAutofill.list[0] });
		}
		busOn('appStateChange', this.iOSStateChange);

		const showCrossSiteTracking =
			await iOSPlugins.iOSAppSettingsPlugin.showAllowCrossSiteTracking();
		if (showCrossSiteTracking.value) {
			this.quasar
				?.dialog({
					component: AllowCrossWebsiteDialog,
					componentProps: {
						title: i18n.global.t('tips'),
						message: i18n.global.t('ios.allow_cross_website_message'),
						btnTitle: i18n.global.t('go_to_open')
					}
				})
				.onOk(() => {
					iOSPlugins.iOSAppSettingsPlugin.jumpToAppSettings();
				});
		}
	}

	async homeUnMounted(): Promise<void> {
		super.homeUnMounted();
		busOff('appStateChange', this.iOSStateChange);
	}

	stateUpdate = () => {
		super.stateUpdate();
		this.iOSUpdatePasswordCredential();
	};

	iOSAppUrlOpen = async (urlEvent: { url: string }) => {
		let identify = '';
		let isAdd = '0';
		if (urlEvent.url.length > 0) {
			const getqyinfo = urlEvent.url.split('?')[1];
			const getqys = getqyinfo.split('&');
			const obj = {};
			for (let i = 0; i < getqys.length; i++) {
				const item = getqys[i].split('=');
				const key = item[0];
				const value = item[1];
				obj[key] = value;
			}
			isAdd = obj['openType'] || '0';
			identify = obj['identify'] || '';
		}
		if (isAdd === '1' && identify.length > 0) {
			updateUIToAddWeb(identify, this.router!);
		}
		await iOSPlugins.iOSAutofillPlugin.clearAutofillList();
	};

	iOSStateChange = async (state: { isActive: boolean }) => {
		if (state.isActive) {
			const iOSAutofill = await iOSPlugins.iOSAutofillPlugin.getAutofillList();
			if (iOSAutofill.list.length > 0) {
				this.iOSAppUrlOpen({ url: iOSAutofill.list[0] });
			}
		}
	};

	iOSUpdatePasswordCredential = async () => {
		const items = this._getItems();
		const identities = items.map((item) => {
			return {
				id: item.item.id,
				userName:
					item.item.fields.find((v) => v.type === FieldType.Username)?.value ||
					'',
				url: item.item.fields.find((v) => v.type === FieldType.Url)?.value || ''
			};
		});

		iOSPlugins.iOSAutofillPlugin
			.replaceAllIdentities({ identities })
			.catch((e) => {
				console.error(e);
			});
	};

	_getItems = () => {
		const items = app.state.vaults.flatMap((vault) =>
			[...vault.items]
				.filter((item) => this.filterWithWebType(item))
				.map((item) => ({ vault, item }))
		);

		items.sort((a, b) => {
			const x = a.item.name.toLowerCase();
			const y = b.item.name.toLowerCase();
			return x > y ? 1 : x < y ? -1 : 0;
		});

		return items;
	};

	filterWithWebType = (rec: VaultItem) => {
		if (rec.icon !== 'web') {
			return false;
		}

		const userName = rec.fields.find((v) => v.type === FieldType.Username);
		const password = rec.fields.find((v) => v.type === FieldType.Password);
		if (password && userName) {
			return true;
		}
		return false;
	};
}
