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
				path: 'Files/Home/:path*',
				name: 'Files',
				component: () => import('pages/Files/FilesPage.vue'),
				meta: {
					requiresAuth: true
				}
			},
			{
				path: 'Files/Application/:path*',
				name: 'Application',
				component: () => import('pages/Files/FilesPage.vue'),
				meta: {
					requiresAuth: true
				}
			},
			{
				path: 'Files/AppData/:path*',
				name: 'AppData',
				component: () => import('pages/Files/FilesPage.vue'),
				meta: {
					requiresAuth: true
				}
			},
			{
				path: 'Files/Seahub/:path*',
				name: 'Seahub',
				component: () => import('pages/Files/FilesPage.vue'),
				meta: {
					requiresAuth: true
				}
			}
		]
	}
];
