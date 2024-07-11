import { GoogleAuth } from 'src/plugins/googleAuth';
import {
	AccountAddMode,
	AccountType,
	GoogleIntegrationAccount,
	OperateIntegrationAuth
} from '../abstractions/integration/integrationService';
import axios from 'axios';
import qs from 'qs';

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

		const api = axios.create({
			baseURL: 'https://oauth2.googleapis.com'
		});

		const data = qs.stringify({
			code: googleDriveSignInResponse.serverAuthCode,
			client_id:
				'343424174381-vrtlie7g85jcso7c98c4vavo17qoied7.apps.googleusercontent.com',
			client_secret: '',
			grant_type: 'authorization_code',
			gidenv: 'ios',
			gpsdk: 'gid-6.2.4',
			audience:
				'343424174381-cprm1j3a6da1bbprra97oc34lap3j0mp.apps.googleusercontent.com',
			emm_support: 1
		});

		const response: any = await api.post('/token', data, {
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
		});

		console.log(response);

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
