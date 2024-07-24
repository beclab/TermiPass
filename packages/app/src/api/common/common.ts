import { DriveType } from './../../stores/files';
import { ActiveMenuType } from './../../stores/files-menu';
import { getParams } from './../../utils/utils';

export async function formatUrltoDriveType(href: string): Promise<DriveType> {
	if (href.indexOf('/Files/Home') > -1) {
		return DriveType.Drive;
	} else if (
		href.indexOf('/Files/Seahub') > -1 ||
		href.indexOf('/repo/') > -1
	) {
		return DriveType.Sync;
	} else if (href.indexOf('/Files/Application') > -1) {
		return DriveType.Cache;
	} else if (href.indexOf('/Files/AppData') > -1) {
		return DriveType.Cache;
	} else {
		return DriveType.Drive;
	}
}

export async function formatUrltoActiveMenu(
	href: string
): Promise<ActiveMenuType> {
	if (href.indexOf('/Files/Home') > -1) {
		const label = decodeURIComponent(href).split('/')[3];
		console.log('labellabellabel', label);
		return {
			label: label,
			id: label,
			driveType: DriveType.Drive
		};
	} else if (href.indexOf('/Files/Seahub') > -1) {
		const label = decodeURIComponent(href).split('/')[3];
		const repo_id = getParams(href, 'id');
		return {
			label: label,
			id: repo_id,
			driveType: DriveType.Sync
		};
	} else if (href.indexOf('/Files/Application') > -1) {
		const label = decodeURIComponent(href).split('/')[2];
		return {
			label: label,
			id: label,
			driveType: DriveType.Drive
		};
	} else if (href.indexOf('/Files/AppData') > -1) {
		const label = decodeURIComponent(href).split('/')[2];
		return {
			label: label,
			id: label,
			driveType: DriveType.Drive
		};
	} else {
		const label = decodeURIComponent(href).split('/')[3];
		return {
			label: label,
			id: label,
			driveType: DriveType.Drive
		};
	}
}
