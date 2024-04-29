import {
	Storage,
	Storable,
	StorableConstructor,
	Err,
	ErrorCode
} from '@didvault/sdk/src/core';
import { UserStorage } from '@didvault/sdk/src/core/PlatformExtension';
import plugins from './iOSRegisterPlugins';

export class IOSStorage implements Storage {
	count(): Promise<number> {
		throw new Err(ErrorCode.NOT_SUPPORTED);
	}

	async save(s: Storable) {
		await plugins.iOSStoragePlugin.set({
			key: `${s.id}`,
			value: JSON.stringify(s.toRaw())
		});
	}

	async saveID<T extends Storable>(id: string, s: T): Promise<void> {
		await plugins.iOSStoragePlugin.set({
			key: `${id}`,
			value: JSON.stringify(s.toRaw())
		});
	}

	async get<T extends Storable>(cls: T | StorableConstructor<T>, id: string) {
		const s = cls instanceof Storable ? cls : new cls();
		const key = `${id}`;
		const data = await plugins.iOSStoragePlugin.get({ key });
		const jsonData = JSON.parse(data.value);
		if (!jsonData) {
			throw new Err(ErrorCode.NOT_FOUND);
		}
		return s.fromRaw(jsonData);
	}

	async delete(s: Storable) {
		await plugins.iOSStoragePlugin.delete({ key: `${s.id}` });
	}

	async clear() {
		// await browser.storage.local.clear();
		await plugins.iOSStoragePlugin.clear();
	}

	async list<T extends Storable>(): Promise<T[]> {
		throw new Err(ErrorCode.NOT_SUPPORTED);
	}
}

export class IOSUserStorage implements UserStorage {
	async getItem(key: string): Promise<any> {
		const data = await plugins.iOSStorageUserPlugin.get({ key });
		try {
			const jsonData = JSON.parse(data.value);
			return jsonData;
		} catch (error) {
			console.error(error);
		}
		return data.value;
	}
	async setItem(key: string, value: any): Promise<void> {
		let saveValue = value;
		if (typeof value != 'string') {
			try {
				saveValue = JSON.stringify(value);
			} catch (error) {
				console.error(error);
			}
		}

		await plugins.iOSStorageUserPlugin.set({
			key,
			value: saveValue
		});
	}
	async removeItem(key: string): Promise<void> {
		await plugins.iOSStorageUserPlugin.delete({ key });
	}
}
