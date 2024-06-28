import { GoogleAuth } from 'src/plugins/googleAuth';
import {
	AccountType,
	GoogleIntegrationAccount,
	OperateIntegrationAuth
} from '../abstractions/integration/integrationService';

export class GoogleAuthService extends OperateIntegrationAuth<GoogleIntegrationAccount> {
	type = AccountType.Google;
	async signIn(): Promise<GoogleIntegrationAccount> {
		const scopes = ['https://www.googleapis.com/auth/drive'];
		await GoogleAuth.initialize({
			scopes
		});
		await GoogleAuth.signOut();
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
