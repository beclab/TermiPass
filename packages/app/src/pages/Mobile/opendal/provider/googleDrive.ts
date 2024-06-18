import { GoogleAuth } from 'src/plugins/googleAuth';

export async function googleDriveAuth() {
	console.log('GoogleDrive ===>');

	await GoogleAuth.signOut();
	GoogleAuth.initialize({
		scopes: ['https://www.googleapis.com/auth/drive']
	});

	const googleDriveSignInResponse = await GoogleAuth.signIn();

	console.log(googleDriveSignInResponse);
}
