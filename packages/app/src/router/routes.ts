import { RouteRecordRaw } from 'vue-router';
import { Platform } from 'quasar';

let routes: RouteRecordRaw[] = [];

if (process.env.PLATFORM == 'WEB') {
	routes = [
		...routes,
		...require('./routes/routes-common').default,
		...require('./routes/routes-web').default
	];
} else if (process.env.PLATFORM == 'MOBILE') {
	console.log('Platform ====>');
	console.log(Platform);

	if (Platform.is.ipad) {
		routes = [...routes, ...require('./routes/routes-desktop').default];
	} else {
		routes = [
			...routes,
			...require('./routes/routes-mobile').default,
			...require('./routes/routes-mobile-common').default,
			...require('./routes/routes-mobile-extension').default
		];
	}
} else if (process.env.PLATFORM == 'DESKTOP') {
	routes = [...routes, ...require('./routes/routes-desktop').default];
} else if (process.env.PLATFORM == 'FILES') {
	routes = [...routes, ...require('./routes/routes-files').default];
}
export default routes;
