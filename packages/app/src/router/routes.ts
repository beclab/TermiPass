import { RouteRecordRaw } from 'vue-router';

let routes: RouteRecordRaw[] = [];

if (process.env.PLATFORM == 'WEB') {
	routes = [
		...routes,
		...require('./routes/routes-common').default,
		...require('./routes/routes-web').default
	];
} else if (process.env.PLATFORM == 'BEX') {
	routes = [
		...routes,
		...require('./routes/routes-bex').default,
		...require('./routes/routes-mobile-common').default
	];
} else if (process.env.PLATFORM == 'MOBILE' || process.env.PLATFORM == 'BEX') {
	routes = [
		...routes,
		...require('./routes/routes-mobile').default,
		...require('./routes/routes-mobile-common').default
	];
	if (process.env.PLATFORM === 'MOBILE') {
		routes = [
			...routes,
			...require('./routes/routes-mobile-extension').default
		];
	} else {
		routes = [...require('./routes/routes-bex').default, ...routes];
	}
} else if (process.env.PLATFORM == 'DESKTOP') {
	routes = [...routes, ...require('./routes/routes-desktop').default];
} else if (process.env.PLATFORM == 'FILES') {
	routes = [...routes, ...require('./routes/routes-files').default];
}
export default routes;
