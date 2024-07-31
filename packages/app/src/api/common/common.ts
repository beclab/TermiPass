import { MenuItem } from 'src/utils/contact';
import { DriveType } from './../../stores/files';
import { ActiveMenuType } from './../../stores/files-menu';
import { getParams } from './../../utils/utils';
import { Data as DriveDataAPI } from '../drive/data';

export function formatUrltoDriveType(href: string): DriveType {
	// console.log('hrefhref', href);
	// console.log('hrefhref', href.startsWith('/Files'));
	if (href.startsWith('/Files')) {
		return DriveType.Drive;
	} else if (href.startsWith('/Seahub') || href.startsWith('/repo')) {
		return DriveType.Sync;
	} else if (href.startsWith('/Data')) {
		return DriveType.Data;
	} else if (href.startsWith('/Cache')) {
		return DriveType.Cache;
	} else {
		return DriveType.Drive;
	}
}

export async function formatUrltoActiveMenu(
	href: string
): Promise<ActiveMenuType> {
	// console.log('hrefhref', href);
	// console.log('hrefhref', href.startsWith('/Files'));
	if (href.startsWith('/Files')) {
		const label = decodeURIComponent(href).split('/')[3] || MenuItem.HOME;
		const driveApi = new DriveDataAPI();
		const menus = await driveApi.fetchMenuRepo();
		const isHome = menus.find((e) => e.key == label) == undefined;
		return {
			label: isHome ? MenuItem.HOME : label,
			id: isHome ? MenuItem.HOME : label,
			driveType: DriveType.Drive
		};
	} else if (href.startsWith('/Seahub')) {
		const label = decodeURIComponent(href).split('/')[2];
		const splitUrl = href.split('?');
		const repo_id = getParams(splitUrl.length > 1 ? splitUrl[1] : href, 'id');

		return {
			label: label,
			id: repo_id,
			driveType: DriveType.Sync
		};
	} else if (href.startsWith('/Data')) {
		// console.log(label);
		return {
			label: MenuItem.DATA,
			id: MenuItem.DATA,
			driveType: DriveType.Data
		};
	} else if (href.startsWith('/Cache')) {
		return {
			label: MenuItem.CACHE,
			id: MenuItem.CACHE,
			driveType: DriveType.Cache
		};
	} else {
		const label = decodeURIComponent(href).split('/')[2];
		return {
			label: label,
			id: label,
			driveType: DriveType.Drive
		};
	}
}

export function filterPcvPath(path: string): string {
	const splitPath = path.split('/');
	const newPathArr: string[] = [];
	for (let i = 0; i < splitPath.length; i++) {
		const path_1 = splitPath[i];
		if (path_1.indexOf('pvc-') <= -1) {
			newPathArr.push(path_1);
		}
	}
	return newPathArr.join('/');
}
