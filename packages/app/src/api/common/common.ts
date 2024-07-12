import { DriveType } from './../../stores/files';

export async function formatUrltoDriveType(href: string): Promise<DriveType> {
	if (href.indexOf('/Files/Home') > -1) {
		return DriveType.Drive;
	} else if (href.indexOf('/Files/Seahub') > -1) {
		return DriveType.Sync;
	} else if (href.indexOf('/Files/Application') > -1) {
		return DriveType.Cache;
	} else if (href.indexOf('/Files/AppData') > -1) {
		return DriveType.Cache;
	} else {
		return DriveType.Drive;
	}
}
