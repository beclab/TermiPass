import Store from 'electron-store';
// import schema from './schema'

const store = new Store({});

const TRANSFER_HISTORY = 'transfer_history';

const CURRENT_USER_DID = 'current_user_did';

const DOWNLOAD_HISTORY = 'download_history';

const DOWNLOAD_SAVE_PATH = 'download_save_path';

const TASKS_PRESENT_DISPLAY_SLEEP = 'tasks_prevent_display_sleep';

const createKeyWithUser = (key: string) => {
	return store.get(CURRENT_USER_DID)
		? store.get(CURRENT_USER_DID) + '-' + key
		: key;
};

export default {
	store,
	TRANSFER_HISTORY,
	CURRENT_USER_DID,
	DOWNLOAD_HISTORY,
	createKeyWithUser,
	DOWNLOAD_SAVE_PATH,
	TASKS_PRESENT_DISPLAY_SLEEP
};
