import {
	Storage,
	Storable,
	StorableConstructor,
	Err,
	ErrorCode
} from '@didvault/sdk/src/core';
import { UserStorage } from '@didvault/sdk/src/core/PlatformExtension';

export class ElectronStorage implements Storage {
	count(): Promise<number> {
		throw new Err(ErrorCode.NOT_SUPPORTED);
	}

	async save(s: Storable) {
		window.electron.store.set(`${s.id}`, JSON.stringify(s.toRaw()));
	}

	async saveID<T extends Storable>(id: string, s: T): Promise<void> {
		window.electron.store.set(`${id}`, JSON.stringify(s.toRaw()));
	}

	async get<T extends Storable>(cls: T | StorableConstructor<T>, id: string) {
		const s = cls instanceof Storable ? cls : new cls();
		const key = `${id}`;
		const data = await window.electron.store.get(key);
		const jsonData = JSON.parse(data);
		if (!jsonData) {
			throw new Err(ErrorCode.NOT_FOUND);
		}
		return s.fromRaw(jsonData);
	}

	async delete(s: Storable) {
		window.electron.store.remove(`${s.id}`);
	}

	async clear() {
		window.electron.store.clear();
	}

	async list<T extends Storable>(): Promise<T[]> {
		throw new Err(ErrorCode.NOT_SUPPORTED);
	}
}

export class ElectronUserStorage implements UserStorage {
	async getItem(key: string): Promise<any> {
		const data = await window.electron.store.get(key);
		try {
			const jsonData = JSON.parse(data);
			return jsonData;
		} catch (error) {
			console.log(error);
		}
		return data;
	}
	async setItem(key: string, value: any): Promise<void> {
		let saveValue = value;
		if (typeof value != 'string') {
			try {
				saveValue = JSON.stringify(value);
			} catch (error) {
				console.log(error);
			}
		}
		window.electron.store.set(key, saveValue);
	}
	async removeItem(key: string): Promise<void> {
		window.electron.store.remove(key);
	}
}
