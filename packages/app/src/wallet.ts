import { initWasm, WalletCore } from '@trustwallet/wallet-core';

class WalletCoreService {
	private _walletCore: WalletCore | undefined;
	private _resolveLoad!: () => void;

	/** Promise that is resolved when the app has been fully loaded */
	loaded = new Promise<void>((resolve) => (this._resolveLoad = resolve));

	get walletCore(): WalletCore {
		if (this._walletCore) {
			return this._walletCore;
		} else {
			throw new Error('core load error');
		}
	}

	async load() {
		// if (this._walletCore) {
		// 	return this.loaded;
		// }

		this._walletCore = await initWasm();

		this._resolveLoad();
		// console.log(this._walletCore);

		return this.loaded;
	}
}

export const walletService = new WalletCoreService();
