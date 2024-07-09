import {
	Platform,
	setPlatform as defaultSetPlatform,
	getPlatform as defaultGetPlatform
} from '@didvault/sdk/src/core';

import { TabbarItem } from '../utils/constants';
import { PlatformExtension } from '@didvault/sdk/src/core/PlatformExtension';
import { HookCapacitorHttpPlugin } from './platformDefined';
import { AppState } from '@didvault/sdk/src/core/app';
import { RouteLocationNormalizedLoaded } from 'vue-router';
import { QVueGlobals } from 'quasar';

/**
 * app App life cycle
 */
export interface AppPlatform extends Platform, PlatformExtension {
	/******** app start *************/
	/**
	 * app.vue start
	 * @param data params
	 */
	appLoadPrepare(data: any): Promise<void>;

	/**
	 * app.vue mounted
	 */
	appMounted(): Promise<void>;

	/**
	 * app.vue unmounted
	 */
	appUnMounted(): Promise<void>;

	/**
	 * app.vue
	 * @param redirect
	 */
	appRedirectUrl(
		redirect: any,
		currentRoute: RouteLocationNormalizedLoaded
	): Promise<void>;

	/******** app home page (mobile) *************/

	tabbarItems: TabbarItem[];

	homeMounted(): Promise<void>;

	homeUnMounted(): Promise<void>;

	/**
	 * hook http request
	 */
	isHookHttpRequest: boolean;

	/**
	 * mobile http hook plugin
	 */
	hookCapacitorHttp: HookCapacitorHttpPlugin;

	/**
	 * server hook
	 */
	hookServerHttp: boolean;

	isMobile: boolean;

	isDesktop: boolean;

	isPad: boolean;

	getFirebaseToken(): Promise<string>;

	getTailscaleId(): Promise<string>;

	reconfigAppStateDefaultValue(appState: AppState): void;

	getQuasar(): QVueGlobals | undefined;
}

export const setAppPlatform = (p: AppPlatform) => {
	defaultSetPlatform(p);
};

export const getAppPlatform = () => {
	return defaultGetPlatform() as AppPlatform;
};
