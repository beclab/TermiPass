import { WalletCore } from '@trustwallet/wallet-core';

let walletService: any;
if (
	process.env.PLATFORM === 'DESKTOP' ||
	process.env.PLATFORM === 'MOBILE' ||
	process.env.PLATFORM === 'BEX'
) {
	const { initWasm } = require('@trustwallet/wallet-core');

	console.log('initWasm', initWasm);
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
			this._walletCore = await initWasm();
			this._resolveLoad();
			return this.loaded;
		}
	}

	walletService = new WalletCoreService();
} else {
	class WalletCoreService2 {
		get walletCore(): any {
			return null;
		}

		async load() {
			return null;
		}
	}

	walletService = new WalletCoreService2();
}

console.log('walletServicewalletService', walletService);

export { walletService };
