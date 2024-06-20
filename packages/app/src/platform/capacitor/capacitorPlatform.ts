/* eslint-disable @typescript-eslint/no-unused-vars */
import {
	BiometricKeyStore,
	getPlatform as defaultGetPlatform
} from '@didvault/sdk/src/core';

import { MobileWebPlatform } from '../terminusCommon/mobileWebPlatform';

import { FCM } from '@capacitor-community/fcm';
import {
	PushNotificationSchema,
	PushNotifications
} from '@capacitor/push-notifications';

import { useUserStore } from '../../stores/user';
// import { app } from '../../globals';
// import { SubmitFirebasePushTokenParams } from '@didvault/sdk/src/core/api';
import { App } from '@capacitor/app';
import { busOn, busOff, busEmit, NetworkUpdateMode } from '../../utils/bus';
import {
	current_user_bind_status,
	BIND_STATUS
} from '../../utils/terminusBindUtils';
import { AppPlatform } from '../appPlatform';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Device } from '@capacitor/device';
import { appleDeviceNames } from '../apple-device-names';
import { Clipboard } from '@capacitor/clipboard';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import DefinePlugins from '../../plugins/registerPlugins';
import { useScaleStore } from '../../stores/scale';
import { hookCapacitorHttp } from '../../plugins/HookCapacitorHttp';
import { Network, ConnectionStatus } from '@capacitor/network';
import {
	ScreenOrientation,
	OrientationLockType
} from '@capacitor/screen-orientation';

import {
	ConfigVPNInterface,
	TermiPassVpnStatus,
	localVPNSDKStatusStringToStatus,
	LocalVPNSDKStatus,
	HostPeerInfo
} from '../terminusCommon/terminusCommonInterface';

import {
	AuthType,
	bytesToString,
	stringToBytes,
	bytesToBase64
} from '@didvault/sdk/src/core';
import {
	AvailableResult,
	NativeBiometric
} from '@capgo/capacitor-native-biometric';
import { BiometricTypeInfo } from 'src/utils/biometricUtil';
import { useSocketStore } from '../../stores/websocketStore';
import { useDeviceStore } from 'src/stores/device';
import { AppState } from '@didvault/sdk/src/core/app';
import { i18n } from '../../boot/i18n';
import {
	registerNativeScanQRProtocols,
	NativeScanQRProtocol
} from './scanQRProtocols';
import { isPad } from 'src/utils/platform';

declare let cordova: any;
declare let plugins: any;

export interface NativeAppPlatform extends AppPlatform {
	getFCMToken(token: { value: string }): Promise<{ token: string }>;
	pushNotificationReceived(notification: PushNotificationSchema): Promise<void>;

	biometricKeyStore: NativeAppBiometricKeyStore;

	openBiometric(): Promise<{
		status: boolean;
		message: string;
	}>;

	closeBiometric(): Promise<{
		status: boolean;
		message: string;
	}>;

	unlockByBiometric(): Promise<string>;

	scanQRDidUserGrantPermission(): Promise<boolean>;

	scanQrCheckPermission(): Promise<void>;

	getQRCodeImageFromPhotoAlbum(): Promise<string>;

	hookBackAction(): void;

	scanQRProtocolList: NativeScanQRProtocol[];

	defaultOrientationLockType: OrientationLockType;

	resetOrientationLockType(): Promise<void>;
}

interface NativeAppBiometricKeyStore extends BiometricKeyStore {
	deleteKey(id: string): Promise<void>;
	isSupportedWithData(): Promise<AvailableResult>;
}

export const getNativeAppPlatform = () => {
	return defaultGetPlatform() as NativeAppPlatform;
};

export const getCapacitorPlatform = () => {
	return defaultGetPlatform() as CapacitorPlatform;
};

const vaultBiometricServerHost = 'www.vault.com';

export class CapacitorPlatform
	extends MobileWebPlatform
	implements NativeAppPlatform, ConfigVPNInterface
{
	/************************************* AppPlatform *************************************************/

	firebaseToken = '';

	scanQRProtocolList = registerNativeScanQRProtocols();

	defaultOrientationLockType: OrientationLockType = 'portrait';

	networkUpdateDelayTimer: NodeJS.Timer | undefined;
	networkUpdateList: ConnectionStatus[] = [];

	busNotification = (notification: PushNotificationSchema) => {
		this.pushNotificationReceived(notification);
	};

	async appMounted() {
		super.appMounted();

		this.isPad = isPad();

		this.resetOrientationLockType();

		const userStore = useUserStore();

		FCM.subscribeTo({ topic: 'test' })
			.then(() => {
				// alert("subscribed to topic");
			})
			.catch((err) => console.error(err));

		const addListeners = async () => {
			const websocketStore = useSocketStore();

			PushNotifications.addListener('registration', async (token) => {
				const pushToken = (await this.getFCMToken(token)).token;

				this.firebaseToken = pushToken;

				busEmit('device_update');

				PushNotifications.removeAllDeliveredNotifications().then(() => {});

				if (userStore.connected) {
					try {
						if (userStore.current_user) {
							websocketStore.send({
								event: 'login',
								data: {
									firebase_token: pushToken,
									name: userStore.current_user.name,
									did: userStore.current_user.id
								}
							});
						}
					} catch (e) {
						console.error(e);
					}
				}
			});

			PushNotifications.addListener('registrationError', (err) => {
				console.error('Registration error: ', err.error);
			});

			PushNotifications.addListener(
				'pushNotificationReceived',
				async (notification) => {
					this.pushNotificationReceived(notification);
				}
			);

			PushNotifications.addListener(
				'pushNotificationActionPerformed',
				(notification) => {
					this.pushNotificationReceived(notification.notification);
				}
			);

			App.addListener('appStateChange', async (state) => {
				const userStatus = current_user_bind_status();
				if (state.isActive && userStatus === BIND_STATUS.BIND_OK) {
					await PushNotifications.removeAllDeliveredNotifications();
				}

				if (this.quasar?.platform.is.ios && this.isUseBiometric) {
					return;
				}
				busEmit('appStateChange', state);
			});

			DefinePlugins.TailscalePlugin.addListener(
				'vpnStatusUpdate',
				async (currentVPNStatus: any) => {
					this.resetVPNStatus(currentVPNStatus);
				}
			);
		};
		addListeners();
		busOn('pushNotificationReceived', this.busNotification);

		if (this.quasar?.platform.is.nativeMobile) {
			const currentVPNStatus = await DefinePlugins.TailscalePlugin.status();
			this.resetVPNStatus(currentVPNStatus);

			const deviceStore = useDeviceStore();
			deviceStore.networkOnLine = (await Network.getStatus()).connected;
			Network.addListener('networkStatusChange', (status) => {
				this.networkUpdateList = [status].concat(this.networkUpdateList);
				if (this.networkUpdateDelayTimer) {
					return;
				}
				this.networkUpdateDelayTimer = setTimeout(() => {
					this.networkUpdateDelayTimer = undefined;
					if (this.networkUpdateList.length > 0) {
						deviceStore.networkOnLine = this.networkUpdateList[0].connected;
						busEmit('network_update', NetworkUpdateMode.update);
					}
					this.networkUpdateList = [];
				}, 5000);
			});
		}
	}

	async appUnMounted() {
		super.appUnMounted();
		App.removeAllListeners();
		PushNotifications.removeAllListeners();
		busOff('pushNotificationReceived', this.busNotification);
	}

	async homeMounted(): Promise<void> {
		super.homeMounted();

		const userStore = useUserStore();
		if (userStore.connected) {
			this.registerNotifications();
		}
	}

	isHookHttpRequest = true;

	async getFirebaseToken() {
		const userStore = useUserStore();
		return this.firebaseToken.length > 0
			? this.firebaseToken
			: userStore.current_id || '';
	}

	async getTailscaleId() {
		return await this.currentNodeId();
	}

	/// Platform interface
	async scanQR() {
		BarcodeScanner.hideBackground();
		await BarcodeScanner.prepare();

		const result = await BarcodeScanner.startScan({
			targetedFormats: ['QR_CODE']
		});
		if (!result.hasContent || !result.content) {
			throw Error('scan fail');
		}
		return result.content;
	}

	async stopScanQR() {
		BarcodeScanner.showBackground();
		BarcodeScanner.stopScan();
	}

	async getDeviceInfo() {
		const device = await Device.getInfo();
		const { manufacturer, model, platform, osVersion } = device;
		const superDeviceInfo = await super.getDeviceInfo();
		const appInfo = await App.getInfo();
		superDeviceInfo.appVersion = appInfo.version;
		superDeviceInfo.vendorVersion = appInfo.build;

		return Object.assign(superDeviceInfo, {
			manufacturer,
			model,
			platform,
			osVersion,
			description: appleDeviceNames[model] || model,
			runtime: 'capacitor'
		});
	}

	async setClipboard(val: string): Promise<void> {
		return new Promise((resolve, reject) => {
			Clipboard.write({
				string: val
			})
				.then(resolve)
				.catch(reject);
		});
	}

	async getClipboard(): Promise<string> {
		return new Promise(async (resolve, reject) => {
			try {
				const { value } = await Clipboard.read();
				resolve(value);
			} catch (error) {
				reject(error);
			}
		});
	}

	async saveFile(fileName: string, type: string, data: Uint8Array) {
		const url = `data:${type};df:${encodeURIComponent(
			fileName
		)};base64,${bytesToBase64(data, false)}`;
		plugins.socialsharing.share(null, fileName, [url], null);
	}

	openExternalUrl(url: string) {
		cordova.InAppBrowser.open(url, 'system');
	}

	biometricKeyStore: NativeAppBiometricKeyStore = {
		async isSupported() {
			return new Promise<boolean>((resolve) =>
				NativeBiometric.isAvailable().then((result) =>
					resolve(result.isAvailable)
				)
			);
		},
		async storeKey(id: string, key: Uint8Array) {
			return new Promise<void>((resolve, reject) => {
				NativeBiometric.setCredentials({
					server: vaultBiometricServerHost,
					password: bytesToString(key),
					username: id || 'userStore.id'
				})
					.then(resolve)
					.catch(reject);
			});
		},

		async getKey(_id: string) {
			return new Promise<Uint8Array>((resolve, reject) => {
				NativeBiometric.getCredentials({
					server: vaultBiometricServerHost
				})
					.then((data) => {
						resolve(stringToBytes(data.password));
					})
					.catch(reject);
			});
		},

		async deleteKey(_id: string) {
			return new Promise<void>((resolve, reject) => {
				NativeBiometric.deleteCredentials({
					server: vaultBiometricServerHost
				})
					.then(resolve)
					.catch(reject);
			});
		},

		async isSupportedWithData() {
			return new Promise((resolve, reject) =>
				NativeBiometric.isAvailable().then(resolve).catch(reject)
			);
		}
	};

	readonly platformAuthType = AuthType.PublicKey;

	supportsPlatformAuthenticator() {
		return this.biometricKeyStore.isSupported();
	}

	reconfigAppStateDefaultValue(appState: AppState) {
		appState.settings.autoLockDelay = 24 * 60;
		appState.settings.syncInterval = 5;
	}

	/************************************ NativeAppPlatform *****************************/

	getFCMToken(token: { value: string }): Promise<{ token: string }> {
		return Promise.resolve({
			token: token.value
		});
	}

	pushNotificationReceived(
		_notification: PushNotificationSchema
	): Promise<void> {
		throw new Error('Method not implemented.');
	}

	openBiometric = async () => {
		const result = await this.configBiometricVerification();
		if (!result) {
			return {
				status: false,
				message: i18n.global.t('biometric.error.biometric_is_not_available')
			};
		}

		const userStore = useUserStore();

		if (!userStore.password) {
			return {
				status: false,
				message: i18n.global.t('password_empty')
			};
		}
		let setCreResult = false;
		let message = '';
		try {
			await this.biometricKeyStore.storeKey(
				userStore.id || 'userStore.id',
				stringToBytes(userStore.password)
			);
			setCreResult = true;
		} catch (error) {
			message = error.message;
		}
		await userStore.updateOpenBiometricStatus(setCreResult);
		return {
			status: setCreResult,
			message
		};
	};

	closeBiometric = async () => {
		const result = await this.configBiometricVerification();
		if (!result) {
			return {
				status: false,
				message: i18n.global.t('biometric.error.biometric_is_not_available')
			};
		}

		const userStore = useUserStore();

		let closeStatus = false;
		let message = '';
		try {
			await this.biometricKeyStore.deleteKey('');
			closeStatus = true;
		} catch (error) {
			message = error.message;
		}
		if (closeStatus) {
			await userStore.updateOpenBiometricStatus(false);
		}
		return {
			status: closeStatus,
			message
		};
	};

	unlockByBiometric = async () => {
		const result = await this.configBiometricVerification();
		if (!result) {
			return '';
		}
		try {
			const password = await this.biometricKeyStore.getKey('');
			return bytesToString(password);
		} catch (error) {
			console.error(error);
		}
		return '';
	};

	private isUseBiometric = false;

	configBiometricVerification = async () => {
		const result = await this.biometricKeyStore.isSupportedWithData();
		if (!result.isAvailable) return false;
		this.isUseBiometric = true;
		return await NativeBiometric.verifyIdentity(
			BiometricTypeInfo[result.biometryType].options
		)
			.then(() => true)
			.catch(() => false)
			.finally(() => {
				this.isUseBiometric = false;
			});
	};

	scanQRDidUserGrantPermission = async () => {
		// check if user already granted permission
		const status = await BarcodeScanner.checkPermission({
			force: false
		});

		if (status.granted) {
			// user granted permission
			return true;
		}

		if (status.denied) {
			// user denied permission
			return false;
		}

		if (status.asked) {
			// system requested the user for permission during this call
			// only possible when force set to true
		}

		if (status.neverAsked) {
			// user has not been requested this permission before
			// it is advised to show the user some sort of prompt
			// this way you will not waste your only chance to ask for the permission
			const c = confirm(
				'We need your permission to use your camera to be able to scan barcodes'
			);
			if (!c) {
				return false;
			}
		}

		if (status.restricted || status.unknown) {
			// ios only
			// probably means the permission has been denied
			return false;
		}

		// user has not denied permission
		// but the user also has not yet granted the permission
		// so request it
		const statusRequest = await BarcodeScanner.checkPermission({
			force: true
		});

		if (statusRequest.asked) {
			// system requested the user for permission during this call
			// only possible when force set to true
		}

		if (statusRequest.granted) {
			// the user did grant the permission now
			return true;
		}

		// user did not grant the permission, so he must have declined the request
		return false;
	};

	scanQrCheckPermission = async () => {
		const status = await BarcodeScanner.checkPermission({});
		if (status.denied) {
			const c = confirm(
				'If you want to grant permission for using your camera, enable it in the app settings.'
			);
			if (c) {
				BarcodeScanner.openAppSettings();
			}
		}
	};

	getQRCodeImageFromPhotoAlbum = async () => {
		const permission = await Camera.checkPermissions();

		if (permission.photos === 'denied') {
			const c = confirm(
				'If you want to grant permission for using your Photos, enable it in the app settings.'
			);
			if (c) {
				BarcodeScanner.openAppSettings();
			}
			return '';
		}

		const photos = await Camera.getPhoto({
			resultType: CameraResultType.Base64,

			source: CameraSource.Photos,

			quality: 10
		});

		if (!photos || !photos.base64String) {
			return '';
		}

		const result = await DefinePlugins.ScanPhotoQR.scan({
			content: photos.base64String
		});

		return result.result.length > 0 ? result.result[0] : '';
	};

	private registerNotifications = async () => {
		let permStatus = await PushNotifications.checkPermissions();

		if (permStatus.receive === 'prompt') {
			permStatus = await PushNotifications.requestPermissions();
		}

		if (permStatus.receive !== 'granted') {
			throw new Error('User denied permissions!');
		}

		await PushNotifications.register();
	};

	async resetOrientationLockType(): Promise<void> {
		if (this.quasar?.platform.is.ipad) {
			return;
		}
		ScreenOrientation.lock({
			orientation: this.defaultOrientationLockType
		});
	}

	/****** ConfigVPNInterface start****/

	vpnDiscriminator = 'ConfigVPNInterface';

	async vpnOpen(options: { authKey: string; server: string }): Promise<void> {
		DefinePlugins.TailscalePlugin.open(options);
	}

	async vpnStop(): Promise<void> {
		// return;
		DefinePlugins.TailscalePlugin.close();
		setTimeout(() => {
			busEmit('network_update', NetworkUpdateMode.vpnStop);
			busEmit('device_update');
		}, 5000);
	}

	async currentNodeId(): Promise<string> {
		return (await DefinePlugins.TailscalePlugin.currentNodeId()).nodeId;
	}

	async hostPeerInfo() {
		const peersInfoJsonString = (
			await DefinePlugins.TailscalePlugin.peersState()
		).state;
		const { Peer } = JSON.parse(peersInfoJsonString);

		let result: HostPeerInfo | undefined;
		Object.keys(Peer).forEach((key) => {
			if (Peer[key].PrimaryRoutes != undefined) {
				result = Peer[key];
				return;
			}
		});
		return result;
	}

	private localVPNSDKStatusToTermiPassVPNStatus(
		vpnStatus: LocalVPNSDKStatus,
		defaultStatus = TermiPassVpnStatus.off
	) {
		if (vpnStatus === LocalVPNSDKStatus.Starting) {
			return TermiPassVpnStatus.connecting;
		}

		if (vpnStatus === LocalVPNSDKStatus.Running) {
			return TermiPassVpnStatus.on;
		}

		if (
			vpnStatus === LocalVPNSDKStatus.Stopped ||
			vpnStatus == LocalVPNSDKStatus.NoState
		) {
			return TermiPassVpnStatus.off;
		}

		return defaultStatus;
	}

	private resetVPNStatus(currentVPNStatus: { status: string; options: any }) {
		const scaleStore = useScaleStore();
		let rStatus = scaleStore.vpnStatus;

		const s = localVPNSDKStatusStringToStatus(currentVPNStatus.status);
		if (this.quasar?.platform.is.android) {
			rStatus = this.localVPNSDKStatusToTermiPassVPNStatus(s, rStatus);
		} else {
			if (currentVPNStatus.options) {
				const extensionVpnStatus =
					currentVPNStatus.options['extensionVpnStatus'];
				if (extensionVpnStatus === 1) {
					rStatus = this.localVPNSDKStatusToTermiPassVPNStatus(s, rStatus);
				} else if (extensionVpnStatus === 3) {
					rStatus = TermiPassVpnStatus.connecting;
				} else if (extensionVpnStatus === 0 || extensionVpnStatus === 4) {
					rStatus = TermiPassVpnStatus.off;
				} else {
					rStatus = TermiPassVpnStatus.Invalid;
				}
			}
		}
		if (!scaleStore.isOn && rStatus == TermiPassVpnStatus.on) {
			setTimeout(() => {
				busEmit('network_update', NetworkUpdateMode.vpnStart);
			}, 10000);
			busEmit('device_update');
		}
		scaleStore.vpnStatus = rStatus;
	}

	/****** ConfigVPNInterface end****/

	/*** hook app request start ***/
	get hookCapacitorHttp() {
		return hookCapacitorHttp;
	}

	async hookBackAction() {
		if (!this.route) {
			return;
		}

		if (this.route.meta['tabIdentify']) {
			if (this.quasar?.platform.is.android) {
				await App.minimizeApp();
			}
			return;
		}

		const userStore = useUserStore();

		if (this.route.meta['noReturn']) {
			if (userStore.users && userStore.users.items.size >= 1) {
				if (this.router) {
					if (userStore.current_user && userStore.current_user.setup_finished) {
						this.router.back();
						return;
					}
					if (this.route.name != 'accounts') {
						this.router.replace('/accounts');
						return;
					}
					if (userStore.current_user?.name) {
						this.router.replace('/connectLoading');
					} else {
						this.router.replace('/bind_vc');
					}
				}
				return;
			}

			// if (!userStore.current_user?.setup_finished) {
			// 	if (this.quasar?.platform.is.android) {
			// 		// await App.minimizeApp();
			// 	}
			// 	return;
			// }
		}
		if (window.history.length <= 1) {
			if (this.quasar?.platform.is.android) {
				await App.minimizeApp();
			}
			return;
		}

		if (this.route.meta && this.route.meta.emptyUserDisableBack) {
			if (
				!userStore.users ||
				!userStore.users.items.size ||
				userStore.users.items.size == 0
			) {
				if (this.quasar?.platform.is.android) {
					await App.minimizeApp();
				}
				return;
			}
		}
		this.router?.back();
	}
}
