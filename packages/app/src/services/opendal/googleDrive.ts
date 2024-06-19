import { GoogleAuth } from 'src/plugins/googleAuth';
import {
	AccountType,
	IntegrationAccount,
	OpendalIntegrationAuth
} from '../abstractions/opendal/opendalService';

export class GoogleAuthService extends OpendalIntegrationAuth {
	type = AccountType.Google;
	async signIn(): Promise<IntegrationAccount> {
		await GoogleAuth.signOut();

		GoogleAuth.initialize({
			scopes: ['https://www.googleapis.com/auth/drive']
		});

		const googleDriveSignInResponse = await GoogleAuth.signIn();
		return {
			name: googleDriveSignInResponse.email,
			type: AccountType.Google,
			raw_data: {
				access_token: googleDriveSignInResponse.authentication.accessToken,
				refresh_token:
					googleDriveSignInResponse.authentication.refreshToken || '',
				expires_at: Date.now() + 30 * 60 * 1000,
				expires_in: 30 * 60 * 1000
			}
		};
	}
}
