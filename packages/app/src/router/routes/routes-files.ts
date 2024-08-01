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
				meta: {
					requiresAuth: true
				}
			},
			{
				path: 'Data/:path*',
				name: 'Data',
				meta: {
					requiresAuth: true
				}
			},
			{
				path: 'Cache/:path*',
				name: 'Cache',
				meta: {
					requiresAuth: true
				}
			},

			{
				path: 'Seahub/:path*',
				name: 'Seahub',
				meta: {
					requiresAuth: true
				}
			},
			{
				path: 'GDrive/:path*',
				name: 'GDrive',
				meta: {
					requiresAuth: true
				}
			},
			{
				path: 'Dropbox/:path*',
				name: 'Dropbox',
				meta: {
					requiresAuth: true
				}
			}
		]
	}
];
