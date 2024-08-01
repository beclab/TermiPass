import { boot } from 'quasar/wrappers';
import BaseComponents from 'components/base';
import BytetradeUi, { BtNotify, BtDialog } from '@bytetrade/ui';
import VueLazyload from 'vue-lazyload';
import { Notify, Dialog } from 'quasar';

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ({ app }) => {
	// something to do
	app.use(BytetradeUi);
	app.use(VueLazyload);
	app.use(BaseComponents);
	BtNotify.init(Notify);
	BtDialog.init(Dialog);
});
