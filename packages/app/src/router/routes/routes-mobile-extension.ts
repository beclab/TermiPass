import { RouteRecordRaw } from 'vue-router';

const mobileExtension: RouteRecordRaw[] = [
	{
		path: '/',
		component: () => import('layouts/MobileMainLayout.vue'),
		children: [
			{
				path: 'home',
				meta: {
					tabIdentify: 'file'
				},
				component: () => import('pages/Mobile/file/FileRootPage.vue')
			}
		]
	},
	{
		path: '/',
		component: () => import('layouts/TermipassMainLayout.vue'),
		name: 'TermipassMainLayout',
		children: [
			{
				path: 'Files/:path*',
				name: 'Files',
				component: () => import('pages/Files/FilesPage.vue')
			}
		]
	}
];

export default mobileExtension;
