import { GoogleAuth } from 'src/plugins/googleAuth';
import {
	AccountType,
	GoogleIntegrationAccount,
	OpendalIntegrationAuth
} from '../abstractions/opendal/opendalService';

export class GoogleAuthService extends OpendalIntegrationAuth<GoogleIntegrationAccount> {
	type = AccountType.Google;
	async signIn(): Promise<GoogleIntegrationAccount> {
		await GoogleAuth.signOut();
		const scopes = ['https://www.googleapis.com/auth/drive'];
		GoogleAuth.initialize({
			scopes
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
				expires_in: 30 * 60 * 1000,
				scope: scopes.join(','),
				id_token: googleDriveSignInResponse.authentication.idToken
			}
		};
	}
}
