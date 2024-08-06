import { route } from 'quasar/wrappers';
import {
	createMemoryHistory,
	createRouter,
	createWebHashHistory,
	createWebHistory
} from 'vue-router';
import routes from './routes-bex';
import { getUiType } from '../utils/utils';
import { useBexStore } from '../stores/bex';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */) {
	const createHistory =
		process.env.SERVER || process.env.IS_BEX
			? createMemoryHistory
			: process.env.VUE_ROUTER_MODE === 'history'
			? createWebHistory
			: createWebHashHistory;

	const Router = createRouter({
		scrollBehavior: () => ({ left: 0, top: 0 }),
		routes,

		// Leave this as is and make changes in quasar.conf.js instead!
		// quasar.conf.js -> build -> vueRouterMode
		// quasar.conf.js -> build -> publicPath
		history: createHistory(
			process.env.MODE === 'ssr' ? void 0 : process.env.VUE_ROUTER_BASE
		)
	});

	Router.beforeEach(async (to, from, next) => {
		if (to || from) {
			/* empty */
		}
		if (getUiType().isNotification) {
			const store = useBexStore();
			const approval = await store.controller.getApproval();
			console.log('approval ===>');
			console.log(approval);

			if (
				approval &&
				approval.data.routerPath &&
				approval.data.routerPath !== to.path
			) {
				next(approval.data.routerPath);
				return;
			}
			if (!approval) {
				window.close();
				return;
			}
		}
		next();
	});

	return Router;
});
