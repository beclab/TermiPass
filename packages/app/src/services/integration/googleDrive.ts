import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import {
	AccountAddMode,
	AccountType,
	GoogleIntegrationAccount,
	OperateIntegrationAuth
} from '../abstractions/integration/integrationService';
import { getAppPlatform } from '../../platform/appPlatform';
import { axiosInstanceProxy } from '../../platform/httpProxy';

export class GoogleAuthService extends OperateIntegrationAuth<GoogleIntegrationAccount> {
	type = AccountType.Google;
	addMode = AccountAddMode.common;
	async signIn(): Promise<GoogleIntegrationAccount> {
		const scopes = ['https://www.googleapis.com/auth/drive'];
		await GoogleAuth.initialize({
			scopes
		});
		await GoogleAuth.signOut();

		const googleDriveSignInResponse = await GoogleAuth.signIn();
		let response;

		let clientId = '';

		if (getAppPlatform().getQuasar()?.platform.is?.android) {
			clientId =
				'343424174381-cprm1j3a6da1bbprra97oc34lap3j0mp.apps.googleusercontent.com';
			const form = new FormData();
			form.append('code', googleDriveSignInResponse.serverAuthCode);
			response = await axiosInstanceProxy({
				baseURL: 'https://cloud-api.jointerminus.com/',
				timeout: 10000,
				headers: {
					'Content-Type': 'application/json'
				}
			}).post('/v1/common/google/token', {
				code: googleDriveSignInResponse.serverAuthCode
			});
			console.log(response);
			if (!response || response.data.code !== 200 || !response.data.data) {
				throw new Error(
					'Exchange authorization code error ' + response.data.data
						? response.data.data.message
						: ''
				);
			}
		} else {
			clientId =
				'343424174381-vrtlie7g85jcso7c98c4vavo17qoied7.apps.googleusercontent.com';
		}

		const result = {
			name: googleDriveSignInResponse.email,
			type: AccountType.Google,
			raw_data: {
				access_token: response
					? response.data.data.accessToken
					: googleDriveSignInResponse.authentication.accessToken,
				refresh_token: response
					? response.data.data.refreshToken
					: googleDriveSignInResponse.authentication.refreshToken || '',
				expires_at: Date.now() + 30 * 60 * 1000,
				expires_in: 30 * 60 * 1000,
				scope: scopes.join(','),
				id_token: googleDriveSignInResponse.authentication.idToken,
				client_id: clientId
			}
		};
		return result;
	}
	async permissions() {
		return {
			title: 'Your Google account grants us the following permissions:',
			scopes: [
				{
					introduce: 'See your profile info',
					icon: 'sym_r_account_circle'
				},
				{
					introduce:
						'See, edit, create, and delete all of your Google Drive files',
					icon: 'sym_r_cloud'
				},
				{
					introduce:
						'See, edit, share, and permanently delete all the calendars you can access using Google Calendar',
					icon: 'sym_r_calendar_today'
				}
			]
		};
	}
}
