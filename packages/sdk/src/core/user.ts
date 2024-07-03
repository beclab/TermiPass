import { PBES2Container } from './container';
import { Storable } from './storage';
//import { Err } from '@didvault/core/src/error';
import { Serializable, Exclude, AsDate, AsSerializable } from './encoding';
import { TerminusDefaultDomain } from '@bytetrade/core';

export type UserItemID = string;
export type LocalUserVaultID = string;

export class MnemonicItem extends Serializable {
	constructor(vals: Partial<UserItem> = {}) {
		super();
		Object.assign(this, vals);
	}

	id: UserItemID = ''; //did

	mnemonic = '';

	@AsDate()
	updated: Date = new Date();
}

export class MnemonicItemCollection
	extends Serializable
	implements Iterable<MnemonicItem>
{
	/** Number of items in this VaultItemCollection */
	get size() {
		return this._items.size;
	}

	private _items: Map<string, MnemonicItem>;

	constructor(items: MnemonicItem[] = []) {
		super();
		this._items = new Map(
			items.map((item) => [item.id, item] as [string, MnemonicItem])
		);
	}

	/** Get an item with a given `id` */
	get(id: string) {
		return this._items.get(id) || null;
	}

	/**
	 * Updates one or more items based on their id. If no item with the same id
	 * exists, the item will be added to the collection
	 */
	update(...items: MnemonicItem[]) {
		for (const item of items) {
			item.updated = new Date();
			this._items.set(item.id, item);
		}
	}

	/**
	 * Removes one or more items based on their id.
	 */
	remove(...items: MnemonicItem[]) {
		for (const item of items) {
			this._items.delete(item.id);
		}
	}

	/**
	 * Merges in changes from another [[UserItemCollection]] instance.
	 */
	merge(coll: MnemonicItemCollection) {
		// Delete any items from this collection that don't
		// exist in the other collection and haven't been changed recently
		for (const item of this) {
			if (!coll.get(item.id)) {
				this._items.delete(item.id);
			}
		}

		// Get changes items from other collection (but only if they haven't recently changed locally)
		for (const item of coll) {
			this._items.set(item.id, item);
		}
	}

	protected _toRaw(version: string) {
		return {
			items: Array.from(this).map((item) => item.toRaw(version))
		};
	}

	protected _fromRaw({ items }: any) {
		this._items = new Map(
			items.map(
				(item: any) =>
					[item.id, new MnemonicItem().fromRaw(item)] as [string, MnemonicItem]
			)
		);
	}

	[Symbol.iterator]() {
		return this._items.values();
	}
}

export class UserItem extends Serializable {
	constructor(vals: Partial<UserItem> = {}) {
		super();
		Object.assign(this, vals);
	}

	id: UserItemID = ''; //did

	//mnemonic = '';

	/** icon to be displayed for this item */
	name = ''; // terminus name

	setup_finished = false;

	terminus_activate_status = 'wait_activate_vault';

	wizard = '';

	offline_mode = false;

	tailscale_activated = false;

	isLocal = false;

	url = '';

	ip = '';

	binding = false;

	/** Date and time of last update */
	@AsDate()
	updated: Date = new Date();

	access_token = '';
	refresh_token = '';
	passed_fa2 = false;
	session_id = '';

	cloud_id = '';
	cloud_token = '';
	cloud_expired = 0;
	terminus_id = '';

	get local_name() {
		const array: string[] = this.name.split('@');
		return array[0];
	}

	get domain_name() {
		const array: string[] = this.name.split('@');
		if (array.length == 2) {
			return array[1];
		} else {
			return TerminusDefaultDomain;
		}
	}

	get terminus_url() {
		const array: string[] = this.name.split('@');
		if (array.length == 2) {
			return 'https://' + this.local_url + array[0] + '.' + array[1] + '';
		} else {
			return (
				'https://' + this.local_url + array[0] + '.' + TerminusDefaultDomain
			);
		}
	}

	get vault_url() {
		const array: string[] = this.name.split('@');
		if (array.length == 2) {
			return (
				'https://vault.' +
				this.local_url +
				array[0] +
				'.' +
				array[1] +
				'/server'
			);
		} else {
			return (
				'https://vault.' +
				this.local_url +
				array[0] +
				'.' +
				TerminusDefaultDomain +
				'/server'
			);
		}
	}

	get auth_url() {
		const array: string[] = this.name.split('@');
		if (array.length == 2) {
			return 'https://auth.' + this.local_url + array[0] + '.' + array[1] + '/';
		} else {
			return (
				'https://auth.' +
				this.local_url +
				array[0] +
				'.' +
				TerminusDefaultDomain +
				'/'
			);
		}
	}

	get local_url() {
		if (this.isLocal) {
			return 'local.';
		}
		return '';
	}
}

export class PreviousUserItem extends UserItem {
	mnemonic = '';
}
/**
 * A collection of vault items items, used for consolidating changes made independently
 * across multiple instances through "merging".
 */
export class UserItemCollection
	extends Serializable
	implements Iterable<UserItem | PreviousUserItem>
{
	/** Number of items in this VaultItemCollection */
	get size() {
		return this._items.size;
	}

	private _items: Map<string, UserItem | PreviousUserItem>;

	constructor(items: UserItem[] | PreviousUserItem[] = []) {
		super();
		this._items = new Map(
			items.map(
				(item) => [item.id, item] as [string, UserItem | PreviousUserItem]
			)
		);
	}

	/** Get an item with a given `id` */
	get(id: string) {
		return this._items.get(id) || null;
	}

	/**
	 * Updates one or more items based on their id. If no item with the same id
	 * exists, the item will be added to the collection
	 */
	update(...items: UserItem[] | PreviousUserItem[]) {
		for (const item of items) {
			item.updated = new Date();
			this._items.set(item.id, item);
		}
	}

	/**
	 * Removes one or more items based on their id.
	 */
	remove(...items: UserItem[] | PreviousUserItem[]) {
		for (const item of items) {
			this._items.delete(item.id);
		}
	}

	/**
	 * Merges in changes from another [[UserItemCollection]] instance.
	 */
	merge(coll: UserItemCollection) {
		// Delete any items from this collection that don't
		// exist in the other collection and haven't been changed recently
		for (const item of this) {
			if (!coll.get(item.id)) {
				this._items.delete(item.id);
			}
		}

		// Get changes items from other collection (but only if they haven't recently changed locally)
		for (const item of coll) {
			this._items.set(item.id, item);
		}
	}

	protected _toRaw(version: string) {
		return {
			items: Array.from(this).map((item) => item.toRaw(version))
		};
	}

	protected _fromRaw({ items }: any) {
		this._items = new Map(
			items.map((item: any) => {
				if (item.mnemonic)
					return [item.id, new PreviousUserItem().fromRaw(item)] as [
						string,
						UserItem | PreviousUserItem
					];
				return [item.id, new UserItem().fromRaw(item)] as [
					string,
					UserItem | PreviousUserItem
				];
			})
		);
	}

	[Symbol.iterator]() {
		return this._items.values();
	}
}

/**
 * Container for securely storing a collection of [[VaultItem]]s. Vaults can be owned by a single
 * user ("private" vaults) or shared between multiple users ("shared" vaults). Shared vaults are
 * provisioned and managed through [[Org]]s.
 */
export class LocalUserVault extends PBES2Container implements Storable {
	/** unique identifier */
	id: LocalUserVaultID = '';

	/** The [[Org]] this vault belongs to (if a shared vault) */
	//org?: OrgInfo = undefined;

	/** Vault name */
	name = '';

	/** Time of creation */
	@AsDate()
	created = new Date(0);

	// /** Time of last update */
	@AsDate()
	updated = new Date(0);

	@Exclude()
	mnemonics = new MnemonicItemCollection();

	/**
	 * A collection [[UserItem]]s representing the senstive data store in this vault
	 *
	 * @secret
	 *
	 * **IMPORTANT**: This property is considered **secret**
	 * and should never stored or transmitted in plain text
	 */
	@AsSerializable(UserItemCollection)
	items = new UserItemCollection();

	// @Exclude()
	// error?: Err;

	/**
	 * Convenience getter for getting a display label truncated to a certain maximum length
	 */
	get label() {
		//return this.org ? `${this.org.name} / ${this.name}` : this.name;
		return this.name;
	}

	async setPassword(password: string) {
		if (this.encryptedData && !this._key) {
			throw 'Account has to be unlocked first.';
		}
		await this._deriveAndSetKey(password);
		// await this._commitSecrets();
		await this.setData(this.mnemonics.toBytes());
		this.updated = new Date();
	}

	/**
	 * Unlocks the vault with the given `account`, decrypting the data stored in the vault
	 * and populating the [[items]] property. For this to be successful, the `account` object
	 * needs to be unlocked and the account must have access to this vault.
	 */
	async unlock(password: string) {
		await super.unlock(password);

		this.mnemonics.fromBytes(await this.getData());
	}

	async lock() {
		await super.lock();
		this.mnemonics = new MnemonicItemCollection();
	}

	get locked() {
		return !this._key;
	}

	/**
	 * Commit changes to `items` by reencrypting the data.
	 */
	async commit() {
		await this.setData(this.mnemonics.toBytes());
	}

	/**
	 * Merges in changes from another `vault`. This requires both vaults to be unlocked.
	 */
	merge(vault: LocalUserVault) {
		this.items.merge(vault.items);
		this.name = vault.name;
		//this.revision = vault.revision;
		//this.org = vault.org;
		//this.accessors = vault.accessors;
		this._key = vault._key;
		this.encryptedData = vault.encryptedData;
		this.updated = vault.updated;
	}

	toString() {
		// return this.org ? `${this.org.name} / ${this.name}` : this.name;
		return this.name;
	}

	clone() {
		const clone = super.clone();
		clone.items = this.items.clone();
		return clone;
	}
}

export class PreviousLocalUserVault extends PBES2Container implements Storable {
	/** unique identifier */
	id: LocalUserVaultID = '';

	/** The [[Org]] this vault belongs to (if a shared vault) */
	//org?: OrgInfo = undefined;

	/** Vault name */
	name = '';

	/** Time of creation */
	@AsDate()
	created = new Date(0);

	// /** Time of last update */
	@AsDate()
	updated = new Date(0);

	/**
	 * A collection [[UserItem]]s representing the senstive data store in this vault
	 *
	 * @secret
	 *
	 * **IMPORTANT**: This property is considered **secret**
	 * and should never stored or transmitted in plain text
	 */
	@Exclude()
	items = new UserItemCollection();

	// @Exclude()
	// error?: Err;

	/**
	 * Convenience getter for getting a display label truncated to a certain maximum length
	 */
	get label() {
		//return this.org ? `${this.org.name} / ${this.name}` : this.name;
		return this.name;
	}

	async setPassword(password: string) {
		if (this.encryptedData && !this._key) {
			throw 'Account has to be unlocked first.';
		}
		await this._deriveAndSetKey(password);
		// await this._commitSecrets();
		await this.setData(this.items.toBytes());
		this.updated = new Date();
	}

	/**
	 * Unlocks the vault with the given `account`, decrypting the data stored in the vault
	 * and populating the [[items]] property. For this to be successful, the `account` object
	 * needs to be unlocked and the account must have access to this vault.
	 */
	async unlock(password: string) {
		await super.unlock(password);
		this.items.fromBytes(await this.getData());
	}

	async lock() {
		await super.lock();
		this.items = new UserItemCollection();
	}

	get locked() {
		return !this._key;
	}

	/**
	 * Commit changes to `items` by reencrypting the data.
	 */
	async commit() {
		await this.setData(this.items.toBytes());
	}

	/**
	 * Merges in changes from another `vault`. This requires both vaults to be unlocked.
	 */
	merge(vault: PreviousLocalUserVault) {
		this.items.merge(vault.items);
		this.name = vault.name;
		//this.revision = vault.revision;
		//this.org = vault.org;
		//this.accessors = vault.accessors;
		this._key = vault._key;
		this.encryptedData = vault.encryptedData;
		this.updated = vault.updated;
	}

	toString() {
		// return this.org ? `${this.org.name} / ${this.name}` : this.name;
		return this.name;
	}

	clone() {
		const clone = super.clone();
		clone.items = this.items.clone();
		return clone;
	}
}
