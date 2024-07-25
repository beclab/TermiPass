import { MenuItem } from 'src/utils/contact';
import { DriveType } from './../../stores/files';
import { ActiveMenuType } from './../../stores/files-menu';
import { getParams } from './../../utils/utils';
import { Data as DriveDataAPI } from '../drive/data';

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
	console.log('formatUrltoActiveMenu ===>');
	console.log(href);

	if (href.indexOf('/Files/Home') > -1) {
		const label = decodeURIComponent(href).split('/')[3] || MenuItem.HOME;
		const driveApi = new DriveDataAPI();
		const menus = await driveApi.fetchMenuRepo();
		const isHome = menus.find((e) => e.key == label) == undefined;
		return {
			label: isHome ? MenuItem.HOME : label,
			id: isHome ? MenuItem.HOME : label,
			driveType: DriveType.Drive
		};
	} else if (href.indexOf('/Files/Seahub') > -1) {
		const label = decodeURIComponent(href).split('/')[3];
		const splitUrl = href.split('?');
		console.log('splitUrl ===>');
		console.log(href);

		const repo_id = getParams(splitUrl.length > 1 ? splitUrl[1] : href, 'id');
		console.log('repo_id ===>', repo_id);

		return {
			label: label,
			id: repo_id,
			driveType: DriveType.Sync
		};
	} else if (href.indexOf('/Files/Application') > -1) {
		// const label = decodeURIComponent(href).split('/')[2] || MenuItem.DATA;
		// console.log(label);
		return {
			label: MenuItem.DATA,
			id: MenuItem.DATA,
			driveType: DriveType.Drive
		};
	} else if (href.indexOf('/Files/AppData') > -1) {
		// const label = decodeURIComponent(href).split('/')[2];
		// label: MenuItem.DATA,
		// 					key: MenuItem.DATA,
		return {
			label: MenuItem.CACHE,
			id: MenuItem.CACHE,
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
