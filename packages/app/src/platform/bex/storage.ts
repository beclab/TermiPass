import { browser } from 'webextension-polyfill-ts';
import {
	Storage,
	Storable,
	StorableConstructor,
	Err,
	ErrorCode
} from '@didvault/sdk/src/core';
import { SimpleStorage } from './simpleStorage';
import { UserStorage } from '@didvault/sdk/src/core/PlatformExtension';
import { useBexStore } from 'src/stores/bex';

export class ExtensionStorage implements Storage, SimpleStorage {
	async save(s: Storable) {
		const data = { [`${s.kind}_${s.id}`]: s.toRaw() };
		await browser.storage.local.set(data);
	}

	async saveID(id: string, s: Storable): Promise<void> {
		const data = { [`${s.kind}_${id}`]: s.toRaw() };
		await browser.storage.local.set(data);
	}

	async get<T extends Storable>(cls: T | StorableConstructor<T>, id: string) {
		const s = cls instanceof Storable ? cls : new cls();
		const key = `${s.kind}_${id}`;
		const data = await browser.storage.local.get(key);
		if (!data[key]) {
			throw new Err(ErrorCode.NOT_FOUND);
		}
		return s.fromRaw(data[key]);
	}

	async delete(s: Storable) {
		await browser.storage.local.remove(`${s.kind}_${s.id}`);
	}

	async clear() {
		await browser.storage.local.clear();
	}

	async list<T extends Storable>(): Promise<T[]> {
		throw new Err(ErrorCode.NOT_SUPPORTED);
	}

	async count(): Promise<number> {
		throw new Err(ErrorCode.NOT_SUPPORTED);
	}

	async getSimple<T>(key: string, dValue: T): Promise<T> {
		const result = await browser.storage.local.get(key);
		return result[key] == undefined || null || '' ? dValue : (result[key] as T);
	}

	async removeSimple(key: string): Promise<void> {
		return await browser.storage.local.remove(key);
	}

	async saveSimple(key: string, value: any): Promise<void> {
		return await browser.storage.local.set({ [key]: value });
	}
}

export class ExtensionUserStorage implements UserStorage {
	async getItem(key: string): Promise<any> {
		const bexStore = useBexStore();
		return await bexStore.controller.storeGetItem(key);
	}

	async setItem(key: string, value: any): Promise<void> {
		const bexStore = useBexStore();
		return await bexStore.controller.storeSetItem(key, value);
	}

	async removeItem(key: string): Promise<void> {
		const bexStore = useBexStore();
		return await bexStore.controller.storeRemoveItem(key);
	}
}
