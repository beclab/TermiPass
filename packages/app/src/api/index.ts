import * as files from './drive/drive';
import * as seahub from './sync/sync';
import * as share from './share';
import * as users from './users';
import * as settings from './settings';
import * as shareToUser from './shareToUser';
import * as ai from './ai';
import * as common from './common/common';
import search from './search';
import commands from './commands';

import { Data as DriveDataAPI } from './drive/data';
import { Data as SyncDataAPI } from './sync/data';
import { Data as DataDataAPI } from './data/data';
import { Data as CacheDataAPI } from './cache/data';
import { Data as GoogleDataAPI } from './google/data';
import { Data as DropboxDataAPI } from './dropbox/data';

import { DriveType } from './../stores/files';

function dataAPIs(
	origin?: DriveType
): SyncDataAPI | DriveDataAPI | DataDataAPI | CacheDataAPI | any {
	const driveType = common.formatUrltoDriveType(window.location.pathname);
	if (origin === DriveType.Sync) {
		return new SyncDataAPI();
	} else if (origin === DriveType.Drive) {
		return new DriveDataAPI();
	} else if (origin === DriveType.Data) {
		return new DataDataAPI();
	} else if (origin === DriveType.Cache) {
		return new CacheDataAPI();
	} else if (origin === DriveType.GoogleDrive) {
		return new GoogleDataAPI();
	} else if (origin === DriveType.Dropbox) {
		return new DropboxDataAPI();
	}

	if (driveType === DriveType.Sync) {
		return new SyncDataAPI();
	} else if (driveType === DriveType.Drive) {
		return new DriveDataAPI();
	} else if (driveType === DriveType.Data) {
		return new DataDataAPI();
	} else if (driveType === DriveType.Cache) {
		return new CacheDataAPI();
	} else if (driveType === DriveType.GoogleDrive) {
		return new GoogleDataAPI();
	} else if (driveType === DriveType.Dropbox) {
		return new DropboxDataAPI();
	} else {
		return new DriveDataAPI();
	}
}

// const driveAPI = new DriveDataAPI();
// const syncAPI = new SyncDataAPI();

export {
	files,
	seahub,
	share,
	users,
	settings,
	commands,
	search,
	shareToUser,
	ai,
	common,
	dataAPIs,
	DriveDataAPI,
	SyncDataAPI,
	DataDataAPI,
	CacheDataAPI,
	GoogleDataAPI,
	DropboxDataAPI
	// driveAPI,
	// syncAPI,
};
