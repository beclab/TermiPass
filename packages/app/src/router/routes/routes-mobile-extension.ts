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
	}
];

export default mobileExtension;
