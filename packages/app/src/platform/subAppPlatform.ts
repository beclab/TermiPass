/* eslint-disable @typescript-eslint/no-unused-vars */
import { AppPlatform } from './appPlatform';
import { WebPlatform } from './platform';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import localStorage from 'localforage/src/localforage';
import { TabbarItem } from '../utils/constants';
import {
	appMounted as commonAppMounted,
	appUnMounted as commonUnMounted,
	appLoadPrepare as commonAppLoadPrepare
} from './appConfigCommon';
import { CapacitorHttp } from '@capacitor/core';
import { AppState } from '@didvault/sdk/src/core/app';
import { RouteLocationNormalizedLoaded } from 'vue-router';
import { QVueGlobals } from 'quasar';

export class SubAppPlatform extends WebPlatform implements AppPlatform {
	async appLoadPrepare(data: any): Promise<void> {
		commonAppLoadPrepare(this, data);
	}
	async appMounted(): Promise<void> {
		commonAppMounted(this);
	}
	async appUnMounted(): Promise<void> {
		commonUnMounted(this);
	}
	appRedirectUrl(
		_redirect: any,
		_currentRoute: RouteLocationNormalizedLoaded
	): Promise<void> {
		throw new Error('Method not implemented.');
	}
	tabbarItems = [] as TabbarItem[];
	homeMounted(): Promise<void> {
		throw new Error('Method not implemented.');
	}
	homeUnMounted(): Promise<void> {
		throw new Error('Method not implemented.');
	}

	userStorage = localStorage;

	isHookHttpRequest = false;

	hookServerHttp = true;

	get hookCapacitorHttp() {
		return CapacitorHttp;
	}

	isMobile = false;

	isDesktop = false;

	async getFirebaseToken() {
		return '';
	}

	async getTailscaleId() {
		return '';
	}

	getQuasar(): QVueGlobals | undefined {
		return undefined;
	}

	reconfigAppStateDefaultValue(_appState: AppState) {}
}
