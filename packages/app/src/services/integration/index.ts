import { useIntegrationStore } from 'src/stores/integration';
import {
	AccountAddMode,
	AccountType,
	IntegrationAuthResult,
	IntegrationService as IntegrationServiceInterface
} from '../abstractions/integration/integrationService';
import { DropboxAuthService } from './dropbox';
import { GoogleAuthService } from './googleDrive';
import { SpaceAuthService } from './space';
import { AWSS3AuthService } from './awss3';
class IntegrationService implements IntegrationServiceInterface {
	supportAuthList = [
		{
			type: AccountType.Dropbox,
			detail: {
				name: 'Dropbox',
				icon: 'dropbox.svg'
			}
		},
		{
			type: AccountType.Space,
			detail: {
				name: 'Space',
				icon: 'space.svg'
			}
		},
		{
			type: AccountType.Google,
			detail: {
				name: 'Google Drive',
				icon: 'google.svg'
			}
		},
		{
			type: AccountType.AWSS3,
			detail: {
				name: 'AWS S3',
				icon: 'aws.svg'
			}
		}
	];

	getAccountByType(request_type: AccountType) {
		return this.supportAuthList.find((e) => e.type == request_type);
	}

	async requestIntegrationAuth(
		request_type: AccountType,
		options: any
	): Promise<IntegrationAuthResult> {
		const result: IntegrationAuthResult = {
			status: false,
			message: '',
			addMode: AccountAddMode.common
		};
		try {
			const authAccountInstance = this.getInstanceByType(request_type);
			if (!authAccountInstance) {
				throw new Error('not support');
			}
			result.addMode = authAccountInstance.addMode;
			result.account = await authAccountInstance.signIn(options);
			if (authAccountInstance.addMode != AccountAddMode.common) {
				return result;
			}
			if (result.account) {
				result.status = true;
				const opendalStore = useIntegrationStore();
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
		if (request_type == AccountType.AWSS3) {
			return new AWSS3AuthService();
		}
		return undefined;
	}
}

export default new IntegrationService();
