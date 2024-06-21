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

import { Data } from './data';
import { Operation } from './operation';

const dataAPI = new Data();
const operationAPI = new Operation();

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
	operationAPI
};
