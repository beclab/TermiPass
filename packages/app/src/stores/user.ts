import { defineStore } from 'pinia';
import {
	PrivateJwk,
	TerminusInfo,
	Token,
	DefaultTerminusInfo,
	TerminusDefaultDomain
} from '@bytetrade/core';
import {
	LocalUserVault,
	UserItem,
	base64ToString,
	uuid
} from '@didvault/sdk/src/core';
import { getPrivateJWK } from '../did/did-key';
import { GeneralJwsSigner } from '../jose/jws/general/signer';
import { i18n } from '../boot/i18n';
import { supportLanguageType } from '../i18n';
import { getAppPlatform } from 'src/platform/appPlatform';
import { app } from '../globals';
import { axiosInstanceProxy } from '../platform/httpProxy';
import { useScaleStore } from './scale';
import {
	current_user_bind_status,
	BIND_STATUS
} from '../utils/terminusBindUtils';
import { refresh_token, SSOTokenRaw } from '../utils/account';
import { NetworkUpdateMode, busEmit } from 'src/utils/bus';
import { useMonitorStore } from './monitor';
import { seafileAPI } from 'src/api/seafileAPI';
import { useDataStore } from './data';

type UserStorageSaveType =
	| 'locale'
	| 'local-user-id'
	| 'current-user-id'
	| 'users'
	| 'openBiometric'
	| 'backupList'
	| 'terminusInfos';

const userModeGetItem = async (key: UserStorageSaveType) => {
	return await getAppPlatform().userStorage.getItem(key);
};

const userModeSetItem = async (key: UserStorageSaveType, value: any) => {
	await getAppPlatform().userStorage.setItem(key, value);
};

const userModeRemoveItem = async (key: UserStorageSaveType) => {
	await getAppPlatform().userStorage.removeItem(key);
};

export interface UserSate {
	users: LocalUserVault | undefined;
	id: string | undefined;
	current_id: string | undefined;
	temp_url: string | undefined;
	temp_import_data: {
		token: Token | undefined;
		terminusName: string | undefined;
		mnemonic: string | undefined;
		osName: string | undefined;
		//localServer 只在mobile有
		localServer: boolean;
	};
	openBiometric: boolean;
	password: string | undefined;

	userUpdating: boolean;

	locale: supportLanguageType;

	backupList: string[];

	checkRequestError: boolean;

	checkRequestCount: number;
}

export let UsersTerminusInfo: Record<string, TerminusInfo | undefined> = {};

export const useUserStore = defineStore('user', {
	state: () => {
		return {
			users: undefined,
			id: undefined,
			current_id: undefined,
			temp_url: undefined,
			temp_import_data: {
				token: undefined,
				terminusName: undefined,
				mnemonic: undefined,
				osName: undefined,
				localServer: false
			},
			openBiometric: false,
			password: undefined,
			userUpdating: false,
			locale: undefined,
			backupList: [],
			reactivation: false,
			SSOInvalid: false,
			srpInvalid: false,
			isLocal: false,
			checkRequestError: false,
			checkRequestCount: 0
		} as UserSate;
	},
	getters: {
		isBooted(): boolean {
			return this.id != undefined;
		},
		isUnlocked(): boolean {
			return this.password !== undefined;
		},
		connected(): boolean {
			if (!this.current_id) {
				return false;
			}
			const user: UserItem = this.users!.items.get(this.current_id!)!;
			return user.setup_finished;
		},
		current_user(): UserItem | null {
			if (!this.current_id) {
				return null;
			}
			if (!this.users) {
				return null;
			}

			return this.users.items.get(this.current_id);
		},
		user_name() {
			return this.current_user ? this.current_user.name.split('@')[0] : '';
		},
		async current_user_private_key(): Promise<PrivateJwk | null> {
			if (!this.current_user) {
				return null;
			}
			return await getPrivateJWK(this.current_user?.mnemonic);
		},
		currentUserBackup(): boolean {
			return this.backupList.find((e) => e == this.current_id) != undefined;
		},
		pingTerminusInfo() {
			if (!this.current_user) {
				return '';
			}
			const array: string[] = this.current_user.name.split('@');
			if (array.length == 1) {
				return 'https://' + 'local.' + array[0] + '.' + TerminusDefaultDomain;
			} else if (array.length == 2) {
				return 'https://' + 'local.' + array[0] + '.' + array[1];
			}

			return '';
		}
	},
	actions: {
		async load() {
			this.locale = (await userModeGetItem('locale')) || undefined;
			if (this.locale) {
				i18n.global.locale.value = this.locale;
			}

			const backupListString = await userModeGetItem('backupList');
			this.backupList =
				backupListString != undefined
					? typeof backupListString == 'string'
						? JSON.parse(backupListString)
						: backupListString
					: [];
			const terminusInfos = await userModeGetItem('terminusInfos');
			UsersTerminusInfo =
				terminusInfos != undefined
					? typeof terminusInfos == 'string'
						? JSON.parse(terminusInfos)
						: terminusInfos
					: {};
			this.id = (await userModeGetItem('local-user-id')) || undefined;
			this.current_id = (await userModeGetItem('current-user-id')) || undefined;
			this.openBiometric = (await userModeGetItem('openBiometric')) || false;
			if (this.id) {
				this.users = new LocalUserVault();
				const res = await userModeGetItem('users');
				this.users.fromRaw(res);
			}
		},
		getModuleSever(
			module: string,
			protocol = 'https:',
			suffix = '',
			useLocal = true
		) {
			if (!this.current_user) {
				return '';
			}

			const array: string[] = this.current_user.name.split('@');
			let server = '';
			if (array.length == 2) {
				server =
					protocol +
					'//' +
					module +
					'.' +
					(useLocal ? this.current_user.local_url : '') +
					array[0] +
					'.' +
					array[1] +
					suffix;
			} else {
				server =
					protocol +
					'//' +
					array[0] +
					(useLocal ? this.current_user.local_url : '') +
					'.' +
					TerminusDefaultDomain +
					suffix;
			}

			return server;
		},

		async create(password: string, openBiometric = false) {
			if (this.id) {
				return;
			}

			this.users = new LocalUserVault();
			this.users.id = await uuid();
			this.users.name = 'LocalUserVault';
			this.users.created = new Date();
			this.users.updated = new Date();
			this.id = this.users.id;
			await this.users.setPassword(password);

			this.openBiometric = openBiometric;

			await userModeSetItem('local-user-id', this.id);

			await this.save();

			await userModeSetItem('openBiometric', this.openBiometric);
		},

		async updateOpenBiometricStatus(openBiometric: boolean) {
			this.openBiometric = openBiometric;
			await userModeSetItem('openBiometric', this.openBiometric);
		},

		async save() {
			if (!this.users || this.users.locked) {
				console.error('save error ' + JSON.stringify(this.users));
				return;
			}

			await this.users.commit();
			await userModeSetItem('users', this.users.toRaw());
		},

		async clear() {
			await userModeRemoveItem('users');
			await userModeRemoveItem('local-user-id');
			await userModeRemoveItem('current-user-id');
			await userModeRemoveItem('openBiometric');
			await userModeRemoveItem('backupList');
			await userModeRemoveItem('terminusInfos');
		},

		async setCurrentID(id: string) {
			this.current_id = id;
			await userModeSetItem('current-user-id', id);

			this.resetCurrentUserData();
		},
		async removeCurrentID() {
			this.current_id = undefined;
			await userModeRemoveItem('current-user-id');
		},
		clearTempData() {
			this.temp_import_data = {
				token: undefined,
				terminusName: undefined,
				mnemonic: undefined,
				osName: undefined,
				localServer: false
			};
		},
		async signJWS(payload: any): Promise<string | null> {
			if (!this.current_user) {
				return null;
			}
			const privateKey = await this.current_user_private_key;
			if (!privateKey) {
				return null;
			}
			const signer = await GeneralJwsSigner.create(
				new TextEncoder().encode(JSON.stringify(payload)),
				[
					{
						privateJwk: privateKey,
						protectedHeader: {
							alg: 'EdDSA',
							kid: this.current_user.id
						}
					}
				]
			);
			const jws = signer.getJws();
			return jws;
		},
		async removeUser(id: string) {
			if (!this.users) {
				return;
			}
			const u = this.users.items.get(id);
			if (!u) {
				return;
			}

			this.users.items.remove(u);

			await this.save();
			await app.removeState(id);
			await this.removeBackupByUserId(id);
			if (this.users.items.size > 0) {
				for (const user of this.users.items) {
					this.current_id = user.id;
					if (this.current_id) {
						await this.setCurrentID(this.current_id);
					} else {
						console.error(' remove User current id is null ');
					}
				}
			} else {
				this.current_id = undefined;
				await userModeRemoveItem('current-user-id');
			}
		},
		async temporaryCreateUser(did: string, name: string, mnemonic: string) {
			const user1 = new UserItem();
			user1.name = name;
			user1.id = did;
			user1.mnemonic = mnemonic;

			return user1;
		},
		async importTemporaryUser(user: UserItem) {
			if (!this.users || this.users.locked) {
				return null;
			}
			this.users.items.update(user);
			await this.save();
			return user;
		},
		async importUser(
			did: string,
			name: string,
			mnemonic: string
		): Promise<UserItem | null> {
			if (!this.users || this.users.locked) {
				console.error('importUser error');
				return null;
			}

			if (this.users.items.get(did)) {
				return this.users.items.get(did);
			}

			const user1 = new UserItem();
			user1.name = name;
			user1.id = did;
			user1.mnemonic = mnemonic;

			this.users.items.update(user1);
			await this.save();
			return user1;
		},
		async updateUserPassword(oldPassword: string, newPassword: string) {
			if (!this.users) {
				return {
					status: false,
					message: 'Empty users'
				};
			}
			if (this.users.locked) {
				return {
					status: false,
					message: 'Please unlock first'
				};
			}

			await this.users.lock();

			try {
				await this.users.unlock(oldPassword);
			} catch (error) {
				return {
					status: false,
					message: error.message ? `${error.message}` : 'Unlock fail'
				};
			}

			const newUsers = new LocalUserVault();
			newUsers.id = this.users.id;
			newUsers.name = this.users.name;
			newUsers.created = this.users.created;
			newUsers.updated = new Date();

			const items = this.users.items;

			newUsers.items.update(...items);

			await newUsers.setPassword(newPassword);

			this.password = newPassword;

			this.users = newUsers;
			await this.save();

			return {
				status: true,
				message: ''
			};
		},

		async updateLanguageLocale(locale: supportLanguageType) {
			this.locale = locale;
			await userModeSetItem('locale', this.locale);
		},

		async updateDeviceInfo(data: any): Promise<boolean> {
			if (!this.current_user || !this.current_user.setup_finished) {
				return false;
			}

			try {
				const baseURL = this.getModuleSever('settings');

				if (!baseURL) {
					return false;
				}
				const instance = axiosInstanceProxy({
					baseURL: baseURL,
					timeout: 1000 * 10,
					headers: {
						'Content-Type': 'application/json',
						'X-Authorization': this.current_user.access_token
					}
				});
				await instance.post('/api/device', data);

				return true;
			} catch (e) {
				return false;
			}
		},

		async listUsers() {
			const userStore = useUserStore();
			if (
				!userStore.current_user ||
				!userStore.current_user.auth_url ||
				!userStore.current_user.name
			) {
				return;
			}
			const baseURL = userStore.current_user.auth_url.replace('/server', '/');
			const instance = axiosInstanceProxy({
				baseURL: baseURL,
				timeout: 1000 * 10,
				headers: {
					'Content-Type': 'application/json',
					'X-Authorization': userStore.current_user.access_token
				}
			});

			const response = await instance.get('/api/users');
			if (
				!response ||
				response.status != 200 ||
				!response.data ||
				response.data.code != 0
			) {
				throw Error('Network error, please try again later');
			}
		},
		resetCurrentUserData() {
			const scale = useScaleStore();
			scale.reset();
			const monitor = useMonitorStore();
			monitor.clear();

			const store = useDataStore();
			const baseURL = store.baseURL();
			seafileAPI.init({ server: baseURL });
		},

		async backupCurrentUser() {
			if (
				!this.current_id ||
				this.backupList.find((e) => e == this.current_id)
			) {
				return;
			}

			this.backupList.push(this.current_id);
			await userModeSetItem('backupList', JSON.stringify(this.backupList));
		},

		async removeBackupByUserId(id: string) {
			const index = this.backupList.findIndex((e) => e == id);
			if (index < 0) {
				return;
			}
			this.backupList.splice(index, 1);
			await userModeSetItem('backupList', JSON.stringify(this.backupList));
		},
		async currentUserRefreshToken() {
			if (!this.current_user) {
				return {
					status: false,
					oldToken: {
						access_token: '',
						refresh_token: '',
						session_id: ''
					},
					newToken: undefined,
					message: 'no has user'
				};
			}
			if (current_user_bind_status() != BIND_STATUS.BIND_OK) {
				return {
					status: false,
					oldToken: {
						access_token: '',
						refresh_token: '',
						session_id: ''
					},
					newToken: undefined,
					message: 'user not setup_finished'
				};
			}

			const user = this.current_user;

			if (user.access_token.length == 0) {
				return {
					status: false,
					oldToken: {
						access_token: '',
						refresh_token: '',
						session_id: ''
					},
					newToken: undefined,
					message: 'user not has access_token'
				};
			}

			try {
				const access_token = user.access_token.split('.')[1];

				const ssoToken: SSOTokenRaw = JSON.parse(base64ToString(access_token));

				const exp = ssoToken.exp;
				const refreshTime = new Date().getTime() / 1000 + 3600 * 24 * 14 - 3600;
				if (exp > refreshTime) {
					return {
						status: false,
						oldToken: {
							access_token: '',
							refresh_token: '',
							session_id: ''
						},
						newToken: undefined,
						message: 'access_token not expired'
					};
				}
				const token = await refresh_token(
					this.getModuleSever('auth'),
					user.refresh_token,
					user.access_token
				);

				const oldrefreshToken = user.refresh_token;
				const oldresessionId = user.session_id;

				user.access_token = token.access_token!;
				user.refresh_token = token.refresh_token!;
				user.session_id = token.session_id!;

				this.users!.items.update(user);
				await this.save();

				return {
					status: true,
					oldToken: {
						access_token: access_token,
						refresh_token: oldrefreshToken,
						session_id: oldresessionId
					},
					newToken: {
						access_token: user.access_token,
						refresh_token: user.refresh_token,
						session_id: user.session_id
					},
					message: 'access_token refresh success'
				};
			} catch (error) {
				console.error('refresh token failed:');
				console.error(error.message);
				return {
					status: false,
					oldToken: {
						access_token: user.access_token,
						refresh_token: user.refresh_token,
						session_id: user.session_id
					},
					newToken: undefined,
					message: 'access_token refresh failed:' + error.message
				};
			}
		},

		updateOfflineMode(offlineMode: boolean) {
			if (this.current_user) {
				this.current_user.offline_mode = offlineMode;
			}
			if (!offlineMode) {
				busEmit('network_update', NetworkUpdateMode.update);
			}
		},

		currentUserSaveTerminusInfo(terminusInfo: TerminusInfo | undefined) {
			UsersTerminusInfo[this.current_id || ''] = terminusInfo;
		},

		setUserTerminusInfo(
			userId: string,
			terminusInfo: TerminusInfo | undefined
		) {
			UsersTerminusInfo[userId] = terminusInfo;
			userModeSetItem('terminusInfos', JSON.stringify(UsersTerminusInfo));
		},

		getUserTerminusInfo(userId: string) {
			return (
				UsersTerminusInfo[userId] || {
					...DefaultTerminusInfo,
					terminusName: this.current_user?.name || ''
				}
			);
		},

		async removeTerminusInfoByUserId(id: string) {
			UsersTerminusInfo[id] = undefined;
			await userModeSetItem('backupList', JSON.stringify(UsersTerminusInfo));
		},

		terminusInfo() {
			const sss = UsersTerminusInfo[this.current_id || ''] || {
				...DefaultTerminusInfo,
				terminusName: this.current_user?.name || ''
			};
			return sss;
		}
	}
});
