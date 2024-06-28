import { DropboxAuth } from 'src/plugins/dropbox';
import {
	AccountType,
	IntegrationAccount,
	OperateIntegrationAuth
} from '../abstractions/integration/integrationService';

export class DropboxAuthService extends OperateIntegrationAuth<IntegrationAccount> {
	type = AccountType.Dropbox;
	async signIn(): Promise<IntegrationAccount> {
		const dropboxSignInResponse = await DropboxAuth.signIn();
		return {
			name: dropboxSignInResponse.uid,
			type: AccountType.Dropbox,
			raw_data: {
				access_token: dropboxSignInResponse.accessToken,
				refresh_token: dropboxSignInResponse.refreshToken || '',
				expires_at: dropboxSignInResponse.tokenExpirationTimestamp
					? Math.trunc(dropboxSignInResponse.tokenExpirationTimestamp * 1000)
					: Date.now() + 30 * 60 * 1000,
				expires_in: dropboxSignInResponse.tokenExpirationTimestamp
					? Math.trunc(
							dropboxSignInResponse.tokenExpirationTimestamp * 1000 - Date.now()
					  )
					: 30 * 60 * 1000
			}
		};
	}
}
