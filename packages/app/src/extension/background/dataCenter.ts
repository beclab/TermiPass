import {
	base64ToBytes,
	base64ToString,
	FieldType,
	stringToBase64,
	UnlockedAccount,
	// UserItem,
	// UserItemCollection,
	MnemonicItem,
	MnemonicItemCollection,
	Vault,
	VaultItem,
	UserItem,
	UserItemCollection
} from '@didvault/sdk/src/core';
import { AppState } from '@didvault/sdk/src/core/app';
import { Menus } from 'webextension-polyfill-ts';
import { getDID, getPrivateJWK } from '../../did/did-key';
import storage from '../provider/storage/storage';
import { walletService } from 'src/wallet';
import { bgBusEmit } from '../utils/bus';

export class DataCenter {
	//extended unlock time in bex background
	private _password: string | undefined = undefined;
	//data
	private _mnemonicItems: MnemonicItemCollection | undefined = undefined;
	private _userItems: UserItemCollection | undefined = undefined;

	private _currentItem: MnemonicItem | undefined = undefined;
	private _currentUser: UserItem | undefined = undefined;

	private _appState: AppState | undefined = undefined;

	constructor() {
		console.log('DataCenter init');
	}

	isLocked() {
		return this._appState === undefined || this._appState.locked;
	}

	async hasUser() {
		const userId = await storage.get('userId', '');
		return !!userId;
	}

	async setUser(userId: string) {
		await storage.set('userId', userId);
	}

	async getUser() {
		return await storage.get('userId', '');
	}

	async setExtensionBadge(enable: boolean) {
		await storage.set('badge', enable);
	}

	async getExtensionBadge() {
		return await storage.get('badge', true);
	}

	async getCurrentName() {
		return !this.isLocked() && (await this.hasUser())
			? this._currentUser?.name
			: '';
	}

	async includeDidKey(didKey: string): Promise<boolean> {
		if (this._mnemonicItems) {
			const didList: string[] = [];
			for (const item of this._mnemonicItems) {
				didList.push(item.id);
			}
			return didList.includes(didKey);
		}
		return false;
	}

	async getCurrentDidKey(): Promise<string> {
		return await getDID(this._currentItem?.mnemonic);
	}

	async getCurrentPrivateJWK(): Promise<any> {
		return await getPrivateJWK(this._currentItem?.mnemonic);
	}

	async getWalletCore() {
		await walletService.loaded;
		return walletService.walletCore;
	}

	async getDefaultEthPrivatekey() {
		await walletService.loaded;
		const { HDWallet, CoinType } = walletService.walletCore;
		const hdWallet = HDWallet.createWithMnemonic(
			this._currentItem!.mnemonic,
			''
		);
		const key = hdWallet.getKey(CoinType.ethereum, this.defaultDriverPath(0));
		return key;
	}

	private defaultDriverPath(index: number) {
		const bip44chainID = 60;

		const { DerivationPath, Purpose } = walletService.walletCore;
		const derivationPath = DerivationPath.create(
			Purpose.bip44,
			bip44chainID,
			0,
			0,
			index
		);
		return derivationPath.description();
	}

	lock() {
		this._appState = undefined;
		this._mnemonicItems = undefined;
		this._currentItem = undefined;
		this._currentUser = undefined;

		this._password = undefined;
		bgBusEmit('BROADCAST_TO_UI', {
			method: 'UNLOCKED_UPDATE',
			params: {
				status: false
			}
		});
	}
	unlock(data: string) {
		this._password = base64ToString(data);
		bgBusEmit('BROADCAST_TO_UI', {
			method: 'UNLOCKED_UPDATE',
			params: {
				status: true,
				password: this._password
			}
		});
	}

	encryptPassword(): string | undefined {
		if (this._password) {
			return stringToBase64(this._password);
		} else {
			return undefined;
		}
	}

	async decryptUserItems(
		accountData: string,
		mnemonicData: string,
		accountId: string
	) {
		if (!accountData) {
			this._userItems = undefined;
			return;
		}

		if (!mnemonicData) {
			this._mnemonicItems = undefined;
			return;
		}

		this._userItems = new UserItemCollection().fromBytes(
			base64ToBytes(accountData)
		);

		this._mnemonicItems = new MnemonicItemCollection().fromBytes(
			base64ToBytes(mnemonicData)
		);

		if (!accountId) {
			this._currentItem = undefined;
			return;
		}
		this._currentItem = this._mnemonicItems.get(accountId)!;
		this._currentUser = this._userItems.get(accountId)!;

		await this._unlockAppState();
	}

	async decryptAppState(data: string) {
		this._appState = new AppState().fromBytes(base64ToBytes(data));
		await this.setExtensionBadge(this._appState.settings.extensionBadge);
		await this._unlockAppState();
	}

	private async _unlockAppState() {
		if (!this._appState || !this._currentItem) {
			return;
		}
		await this._appState!.account?.unlock(this._currentItem.mnemonic);
		if (this._appState.vaults && this._appState.vaults.length > 0) {
			for (let index = 0; index < this._appState.vaults.length; index++) {
				const vault = this._appState.vaults[index];
				try {
					await vault.unlock(this._appState!.account as UnlockedAccount);
				} catch (error) {
					vault.error = error;
				}
			}
		}
	}

	getWebVaultItems(url?: string): VaultItem[] {
		return this._getVaultItems('web', url);
	}

	_getVaultItems(type?: string, url?: string): VaultItem[] {
		if (!this._appState) {
			return [];
		}
		return this._appState.vaults.flatMap((vault) =>
			[...vault.items]
				.filter((item) => this._filterByString(item, type, url))
				.map((item) => item)
		);
	}

	getVaults(): Vault[] {
		if (!this._appState) {
			return [];
		}
		return this._appState.vaults;
	}

	findChildItem(info: Menus.OnClickData) {
		const id = (info.menuItemId as string).replace(
			`${info.parentMenuItemId}_`,
			''
		);
		return this.findChildItemById(id);
	}

	findChildItemById(id: string) {
		return this.getWebVaultItems().find((it) => {
			return it.id == id;
		});
	}

	private _filterByString(
		item: VaultItem,
		type?: string,
		url?: string
	): boolean {
		if (item.icon == type) {
			const nameField = item.fields.find((v) => v.type === FieldType.Username);
			const pwdField = item.fields.find((v) => v.type === FieldType.Password);
			if (url) {
				const urlFields = item.fields.filter((v) => v.type === FieldType.Url);

				if (urlFields) {
					const urlField = urlFields.find((field) => {
						return field.value.search(url.toLowerCase()) !== -1;
					});
					return !!urlField;
				}
			}
			if (nameField && pwdField) {
				return true;
			}
		}
		return false;
	}

	clearData() {
		this._appState = undefined;
		this._mnemonicItems = undefined;
		this._currentItem = undefined;
		this._currentUser = undefined;
		this._userItems = undefined;
	}
}
