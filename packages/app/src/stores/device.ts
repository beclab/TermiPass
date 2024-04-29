import { defineStore } from 'pinia';
import { useUserStore } from './user';
import { useScaleStore } from './scale';
import { getAppPlatform } from '../platform/appPlatform';
import { DeviceInfo } from '@didvault/sdk/src/core';
import { app } from 'src/globals';
import { TermiPassDeviceInfo } from '@bytetrade/core';

export type DeviceStoreState = {
	networkOnLine: boolean;
};

export const useDeviceStore = defineStore('device', {
	state: () => {
		return {
			networkOnLine: navigator.onLine
		} as DeviceStoreState;
	},

	getters: {},

	actions: {
		async getTermiPassInfo() {
			const userStore = useUserStore();

			const scaleStore = useScaleStore();

			const platform = getAppPlatform();

			const device_info: DeviceInfo = await platform.getDeviceInfo();

			const info = new TermiPassDeviceInfo(device_info);

			if (userStore.id) {
				info.id = userStore.id;
			}

			info.tailScaled = scaleStore.isOn;

			info.client_type = platform.isMobile
				? 'termiPass'
				: platform.isDesktop
				? 'desktop'
				: '';

			info.firebase_token = await platform.getFirebaseToken();

			info.tailScale_id = await platform.getTailscaleId();

			info.srp_id =
				app.authInfo && app.authInfo.sessions.length > 0
					? app.authInfo.sessions[0].id
					: '';

			return info;
		},

		compareTerminuPassInfo(
			oldValue: TermiPassDeviceInfo,
			newValue: TermiPassDeviceInfo
		) {
			return (
				// oldValue.termiPassID == newValue.termiPassID &&
				oldValue.platform == newValue.platform &&
				oldValue.osVersion == newValue.osVersion &&
				oldValue.id == newValue.id &&
				oldValue.appVersion == newValue.appVersion &&
				oldValue.vendorVersion == newValue.vendorVersion &&
				oldValue.userAgent == newValue.userAgent &&
				oldValue.locale == newValue.locale &&
				oldValue.manufacturer == newValue.manufacturer &&
				oldValue.model == newValue.model &&
				oldValue.browser == newValue.browser &&
				oldValue.browserVersion == newValue.browserVersion &&
				oldValue.description == newValue.description &&
				oldValue.runtime == newValue.runtime &&
				oldValue.tailScaled == newValue.tailScaled &&
				oldValue.tailScale_id == newValue.tailScale_id &&
				oldValue.sso == newValue.sso &&
				oldValue.srp_id == newValue.srp_id &&
				oldValue.createTime == newValue.createTime &&
				oldValue.lastSeenTime == newValue.lastSeenTime &&
				oldValue.lastIp == newValue.lastIp &&
				oldValue.client_type == newValue.client_type &&
				oldValue.firebase_token == newValue.firebase_token
			);
		}
	}
});
