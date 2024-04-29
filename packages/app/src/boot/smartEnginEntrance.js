import { boot } from 'quasar/wrappers';
import BaseComponents from 'components/base';
import BytetradeUi, { BtNotify, BtDialog } from '@bytetrade/ui';
import VueLazyload from 'vue-lazyload';
import Vue3VideoPlayer from '@cloudgeek/vue3-video-player';
import { Notify, Dialog } from 'quasar';
import '@cloudgeek/vue3-video-player/dist/vue3-video-player.css';

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ({ app }) => {
	// something to do
	app.use(BytetradeUi);
	app.use(VueLazyload);
	app.use(BaseComponents);
	app.use(Vue3VideoPlayer);
	BtNotify.init(Notify);
	BtDialog.init(Dialog);
});
