import { DropboxAuth } from 'src/plugins/dropbox';
import {
	AccountAddMode,
	AccountType,
	IntegrationAccount,
	OperateIntegrationAuth
} from '../abstractions/integration/integrationService';

export class DropboxAuthService extends OperateIntegrationAuth<IntegrationAccount> {
	type = AccountType.Dropbox;
	addMode = AccountAddMode.common;
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
	async permissions() {
		return {
			title: 'Your Dropbox account grants us the following permissions:',
			scopes: [
				{
					introduce: 'See your profile info',
					icon: 'sym_r_account_circle'
				},
				{
					introduce: 'See, edit, create, and delete all of your Dropbox files',
					icon: 'sym_r_cloud'
				}
			]
		};
	}
}
