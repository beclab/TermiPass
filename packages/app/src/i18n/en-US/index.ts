// This is just an example,
// so you can safely delete all default props below

import termipass_en from '../modules/termipass/en-US/index';
import vault_en from '../modules/vault/en-US';
import files_en from '../modules/files/en-US';
import common_en from '../modules/common/en-US';

export default {
	...common_en,
	...termipass_en,
	...vault_en,
	...files_en
};
