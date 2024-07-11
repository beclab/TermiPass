import * as files from './drive/drive';
import * as seahub from './sync/sync';
import * as share from './share';
import * as users from './users';
import * as settings from './settings';
import * as shareToUser from './shareToUser';
import * as ai from './ai';
import search from './search';
import commands from './commands';

import { Data as DriveDataAPI } from './drive/data';
import { Data as SyncDataAPI } from './sync/data';

import { getParams } from '../utils/utils';
import { DriveType } from './../stores/files';

function dataAPIs(origin?: DriveType): SyncDataAPI | DriveDataAPI {
	const query = getParams(window.location.href, 'id');
	console.log('dataAPIs', origin, '--', DriveType.Sync);
	if (origin === DriveType.Sync) {
		return new SyncDataAPI();
	} else if (origin === DriveType.Drive) {
		return new DriveDataAPI();
	}
	if (query) {
		return new SyncDataAPI();
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
	dataAPIs,
	DriveDataAPI,
	SyncDataAPI
	// driveAPI,
	// syncAPI,
};
