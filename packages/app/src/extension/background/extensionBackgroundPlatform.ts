import { StubPlatform, getPlatform } from '@didvault/sdk/src/core';
import { ExtensionStorage } from '../../platform/bex/storage';
import WebCryptoProvider from '@didvault/sdk/src/crypto';
import { DataCenter } from './dataCenter';

export class ExtensionBackgroundPlatform extends StubPlatform {
	storage = new ExtensionStorage();
	private _dataCenter = new DataCenter();

	constructor() {
		super();
		this.crypto = new WebCryptoProvider();
	}

	async setAutofillBadgeEnable(enable: boolean) {
		return await this.storage.saveSimple('AutofillBadge', enable);
	}

	async getAutofillBadgeEnable() {
		return await this.storage.getSimple<boolean>('AutofillBadge', true);
	}

	async setRssBadgeEnable(enable: boolean) {
		return await this.storage.saveSimple('RssBadge', enable);
	}

	async getRssBadgeEnable() {
		return await this.storage.getSimple<boolean>('RssBadge', true);
	}

	async setApprovalBadgeEnable(enable: boolean) {
		return await this.storage.saveSimple('ApprovalBadge', enable);
	}

	async getApprovalBadgeEnable() {
		return await this.storage.getSimple<boolean>('ApprovalBadge', true);
	}

	async getDeviceInfo() {
		const info = await super.getDeviceInfo();
		info.description = `${info.browser} extension on ${info.platform}`;
		info.runtime = 'extension';
		return info;
	}

	get dataCenter(): DataCenter {
		return this._dataCenter;
	}
}

export const getExtensionBackgroundPlatform = () => {
	return getPlatform() as ExtensionBackgroundPlatform;
};
