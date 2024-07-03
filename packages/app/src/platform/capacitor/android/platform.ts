import { PushNotificationSchema } from '@capacitor/push-notifications';
import { App } from '@capacitor/app';
import { busOn, busOff, busEmit } from '../../../utils/bus';
import { CapacitorPlatform } from '../capacitorPlatform';
import { updateUIToAddWeb } from '../../addItem';
import { addAxiosProxyGlobalRequestInterceptor } from '../../httpProxy';
import AndroidPlugins from './androidPlugins';
import { useUserStore } from '../../../stores/user';
import { TermipassConfig } from '../../../utils/config';

export enum AUTO_FILL_TYPE {
	FRAMEWORK = 'AUTOFILL_FRAMEWORK',
	ACCESSIBILITY = 'ACCESSIBILITY'
}

export class AndroidMobilePlatform extends CapacitorPlatform {
	tempAction: (() => void) | null;

	_performAction(func: () => void) {
		const userStore = useUserStore();
		const isLocked = !userStore.password;
		if (isLocked) {
			this.tempAction = func;
		} else {
			func();
		}
	}

	async pushNotificationReceived(
		notification: PushNotificationSchema
	): Promise<void> {
		if (notification.data && notification.data['message']) {
			const body: string = notification.data['message'];
			busEmit('receiveMessage', body);
		}
	}

	async appMounted(): Promise<void> {
		super.appMounted();

		addAxiosProxyGlobalRequestInterceptor((config) => {
			if (
				config.headers &&
				config.headers['Content-Type'] === 'application/x-www-form-urlencoded'
			) {
				let keyValues = '';
				for (const [key, value] of config.data as any) {
					if (keyValues) {
						keyValues = keyValues + '&';
					}
					keyValues = keyValues + key + '=' + value;
				}
				config.data = keyValues;
			}

			return config;
		});

		App.addListener('backButton', async (state) => {
			if (this.route && this.router) {
				if (this.route.meta['exit']) {
					busEmit('backButton', state);
					return;
				}
				this.hookBackAction();
			}
		});

		AndroidPlugins.Accessibility.addListener(
			'onAutofillAccessibility',
			({ uri }) => {
				this._performAction(async () => {
					const userStore = useUserStore();
					if (!(await userStore.unlockFirst())) {
						this.router?.back();
						return;
					}
					if (this.router && uri) {
						if (this.route?.path.includes('/autoFillList')) {
							this.router.replace({
								path: '/autoFillList',
								query: {
									uri: uri,
									type: AUTO_FILL_TYPE.ACCESSIBILITY
								}
							});
						} else {
							this.router.push({
								path: '/autoFillList',
								query: {
									uri: uri,
									type: AUTO_FILL_TYPE.ACCESSIBILITY
								}
							});
						}
					}
				});
			}
		);

		AndroidPlugins.AutofillFramework.addListener(
			'onAutofillFramework',
			({ uri }) => {
				this._performAction(async () => {
					const userStore = useUserStore();
					if (!(await userStore.unlockFirst())) {
						// this.router?.back();
						AndroidPlugins.AndroidUniversal.finish();
						return;
					}
					if (this.router && uri) {
						this.router.replace({
							path: '/autoFillList',
							query: {
								uri: uri,
								type: AUTO_FILL_TYPE.FRAMEWORK
							}
						});
					}
				});
			}
		);

		AndroidPlugins.AutofillFramework.addListener(
			'onAutofillFrameworkSave',
			({ uri, data }) => {
				this._performAction(() => {
					if (this.router) {
						const { username, password } = JSON.parse(data);
						updateUIToAddWeb(uri, this.router, username, password);
					}
				});
			}
		);

		TermipassConfig.jwt_payload_nbf_sub_second = 10;
	}

	async homeMounted(): Promise<void> {
		super.homeMounted();
		this.androidStateChange({ isActive: true });
		busOn('appStateChange', this.androidStateChange);

		if (this.tempAction) {
			this.tempAction();
			this.tempAction = null;
		}
	}

	async homeUnMounted(): Promise<void> {
		super.homeUnMounted();
		busOff('appStateChange', this.androidStateChange);
	}

	androidStateChange = async (state: { isActive: boolean }) => {
		if (state.isActive && this.router) {
			//Do Nothing
		}
	};
}
