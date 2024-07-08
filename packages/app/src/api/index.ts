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

import { getParams } from '../utils/utils';
import { OriginType } from './common/encoding';

function dataAPIs(origin?: OriginType): SyncDataAPI | DriveDataAPI {
	const query = getParams(window.location.href, 'id');
	if (origin === OriginType.SYNC) {
		return new SyncDataAPI();
	} else if (origin === OriginType.DRIVE) {
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
	common,
	dataAPIs,
	DriveDataAPI,
	SyncDataAPI
	// driveAPI,
	// syncAPI,
};
