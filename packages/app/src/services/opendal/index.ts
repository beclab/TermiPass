import { useOpendalStore } from 'src/stores/opendal';
import {
	AccountType,
	OpendalAuthResult,
	OpendalService as OpendalServiceInterface
} from '../abstractions/opendal/opendalService';
import { DropboxAuthService } from './dropbox';
import { GoogleAuthService } from './googleDrive';
import { SpaceAuthService } from './space';
class OpendalService implements OpendalServiceInterface {
	supportAuthList = [
		{
			type: AccountType.Dropbox,
			name: 'Dropbox'
		},
		{
			type: AccountType.Google,
			name: 'Google Drive'
		},
		{
			type: AccountType.Space,
			name: 'Space'
		}
	];

	async requestOpendalAuth(
		request_type: AccountType
	): Promise<OpendalAuthResult> {
		const result: OpendalAuthResult = {
			status: false,
			message: ''
		};
		try {
			const authAccountInstance = this.getInstanceByType(request_type);
			if (!authAccountInstance) {
				throw new Error('not support');
			}
			result.account = await authAccountInstance.signIn();
			if (result.account) {
				result.status = true;
				const opendalStore = useOpendalStore();
				await opendalStore.createAccount(result.account);
			}
		} catch (e) {
			result.message = e.message ? e.message : 'Auth failed';
		}
		return result;
	}

	getInstanceByType(request_type: AccountType) {
		if (request_type == AccountType.Dropbox) {
			return new DropboxAuthService();
		}
		if (request_type == AccountType.Google) {
			return new GoogleAuthService();
		}
		if (request_type == AccountType.Space) {
			return new SpaceAuthService();
		}
		return undefined;
	}
}

export default new OpendalService();
