import * as files from './files';
import * as seahub from './seahub';
import * as share from './share';
import * as users from './users';
import * as settings from './settings';
import * as pub from './pub';
import * as shareToUser from './shareToUser';
import * as ai from './ai';
import search from './search';
import commands from './commands';

import { Data as DataAPI } from './data';
import { Data as DriveDataAPI } from './drive/data';
import { Data as SyncDataAPI } from './sync/data';

import { Operation } from './operation';
import { getParams } from '../utils/utils';

function dataAPIsa(): SyncDataAPI | DriveDataAPI {
	const query = getParams(window.location.href, 'id');
	if (query) {
		return new SyncDataAPI();
	} else {
		return new DriveDataAPI();
	}
}

const operationAPI = new Operation();
const dataAPI = new DataAPI();
// const driveAPI = new DriveDataAPI();
// const syncAPI = new SyncDataAPI();

export {
	files,
	seahub,
	share,
	users,
	settings,
	pub,
	commands,
	search,
	shareToUser,
	ai,
	dataAPI,
	dataAPIsa,
	// driveAPI,
	// syncAPI,
	operationAPI
};
