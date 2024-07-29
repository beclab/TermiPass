export default [
	{
		path: '/',
		component: () => import('layouts/FilesMainLayout.vue'),
		beforeEnter: (
			to: any,
			_from: any,
			next: (arg0?: { path: string } | undefined) => void
		) => {
			if (to.fullPath == '/') {
				return next({ path: '/Files/Home' });
			}

			next();
		},
		children: [
			{
				path: 'Files/:path*',
				name: 'Files',
				component: () => import('pages/Files/FilesPage.vue'),
				meta: {
					requiresAuth: true
				}
			},
			{
				path: 'Data/:path*',
				name: 'Data',
				component: () => import('pages/Files/FilesPage.vue'),
				meta: {
					requiresAuth: true
				}
			},
			{
				path: 'Cache/:path*',
				name: 'Cache',
				component: () => import('pages/Files/FilesPage.vue'),
				meta: {
					requiresAuth: true
				}
			},
			{
				path: 'Seahub/:path*',
				name: 'Seahub',
				component: () => import('pages/Files/FilesPage.vue'),
				meta: {
					requiresAuth: true
				}
			}
		]
	}
];
