import { walletService } from '../wallet';
import { AppPlatform } from './appPlatform';
import { useSSIStore } from '../stores/ssi';
import { useCloudStore } from '../stores/cloud';
import { QVueGlobals } from 'quasar';
import { setAppPlatform } from './appPlatform';
import { WebPlatform } from './web/platform';
import { IOSMobilePlatform } from './capacitor/iOS/platform';
import { AndroidMobilePlatform } from './capacitor/android/platform';
import { MobileWebPlatform } from './terminusCommon/mobileWebPlatform';
import { MacPlatform } from './electron/mac/platform';
import { WinPlatform } from './electron/win/platform';
import { useDeviceStore } from 'src/stores/device';
// import { busEmit } from '../utils/bus';
import { SubAppPlatform } from './subAppPlatform';
import { NetworkUpdateMode, busEmit } from 'src/utils/bus';

declare global {
	interface Window {
		google: any;
	}
}

export const appLoadPrepare = (_platform: AppPlatform, data: any) => {
	const ssiStore = useSSIStore();
	const cloudStore = useCloudStore();
	ssiStore.setDIDUrl('https://did-gate-v3.bttcdn.com/');
	ssiStore.setVCUrl('https://vc-gate-v3.bttcdn.com/');
	cloudStore.setUrl('https://cloud-api.bttcdn.com');

	walletService.load();

	const quasar = data.quasar as QVueGlobals;
	if (!quasar.platform.is.bex) {
		console.log('walletService load');
		walletService.load();
	}

	if (quasar) {
		if (!quasar.platform.is.nativeMobile && !quasar.platform.is.bex) {
			const script = document.createElement('script');
			script.src = 'https://accounts.google.com/gsi/client';
			document.body.appendChild(script);
		}

		if (!quasar.platform.is.nativeMobile && !quasar.platform.is.win) {
			const updateOnlineStatus = () => {
				const deviceStore = useDeviceStore();
				deviceStore.networkOnLine = navigator.onLine;
				busEmit('network_update', NetworkUpdateMode.update);
			};
			window.addEventListener('online', updateOnlineStatus);
			window.addEventListener('offline', updateOnlineStatus);
		}
	}
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const appMounted = (_platform: AppPlatform) => {
	console.log(_platform);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const appUnMounted = (_platform: AppPlatform) => {
	console.log(_platform);
};

export const configPlatform = (quasar: QVueGlobals) => {
	if (process.env.IS_BEX) {
		return;
	}

	let platform: SubAppPlatform = new WebPlatform();

	if (process.env.PLATFORM == 'MOBILE') {
		if (quasar.platform.is.nativeMobile) {
			if (quasar.platform.is.ios) {
				platform = new IOSMobilePlatform();
			} else if (quasar.platform.is.android) {
				platform = new AndroidMobilePlatform();
			}
		} else {
			platform = new MobileWebPlatform();
		}
	} else if (process.env.PLATFORM == 'DESKTOP') {
		if (quasar.platform.is.mac) {
			platform = new MacPlatform();
		} else if (quasar.platform.is.win) {
			platform = new WinPlatform();
		}
	}

	setAppPlatform(platform);
};
