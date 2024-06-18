import { OpendalType } from 'src/utils/opendal';
import { dropboxAuth } from './dropbox';
import { googleDriveAuth } from './googleDrive';

export async function requestOpenalAuth(request_type: OpendalType) {
	try {
		if (request_type == OpendalType.Dropbox) {
			await dropboxAuth();
		}
		if (request_type == OpendalType.GoogleDrive) {
			await googleDriveAuth();
		}
		return '';
	} catch (e) {
		return '';
	}
}
