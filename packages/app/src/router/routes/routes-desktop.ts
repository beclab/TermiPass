import { RouteRecordRaw } from 'vue-router';

const desktop: RouteRecordRaw[] = [
	{
		path: '/',
		component: () => import('pages/Desktop/import/DesktopLoginLayout.vue'),
		children: [
			{
				path: '/welcome',
				name: 'welcome',
				component: () => import('pages/Desktop/import/WelcomePage.vue')
			},
			{
				path: '/setUnlockPassword',
				name: 'setUnlockPassword',
				component: () => import('pages/Desktop/import/SetUnlockPwdPage.vue')
			},
			{
				path: '/import_mnemonic',
				name: 'InputMnemonic',
				component: () => import('pages/Desktop/import/InputMnemonicPage.vue')
			},
			{
				path: 'connectLoading',
				component: () => import('src/pages/Mobile/connect/ConnectLoading.vue')
			},
			{
				path: 'ConnectTerminus',
				component: () => import('src/pages/Mobile/connect/ConnectTerminus.vue')
			}
			// {
			// 	path: 'check_fa',
			// 	component: () =>
			// 		import('pages/Desktop/import/SecondVerificationPage.vue')
			// }
		]
	},
	{
		path: '/unlock',
		component: () => import('pages/Desktop/unlock/DesktopUnlockLayout.vue'),
		children: [
			{
				path: '',
				component: () => import('pages/Desktop/unlock/UnlockPage.vue')
			}
		]
	},
	{
		path: '/',
		component: () => import('layouts/TermipassMainLayout.vue'),
		name: 'TermipassMainLayout',
		children: [
			{
				path: 'transmission',
				component: () => import('pages/Desktop/TransferPage.vue')
			},
			{
				path: 'systemSettings',
				component: () => import('pages/Desktop/SettingsPage/Account.vue')
			},
			{
				path: 'accountCenter',
				component: () => import('src/pages/Desktop/SettingsPage/Account.vue')
			},
			{
				path: 'Files/:path*',
				name: 'Files',
				component: () => import('pages/Files/FilesPage.vue')
			},
			{
				path: 'Seahub/:path*',
				name: 'Seahub',
				component: () => import('pages/Files/FilesPage.vue')
			},
			{
				path: 'Drive/:path*',
				name: 'Drive',
				component: () => import('pages/Files/FilesPage.vue')
			},
			{
				path: 'items/',
				component: () => import('pages/Items/ItemsPage.vue')
			},
			{
				path: 'items/:itemid',
				component: () => import('pages/Items/ItemsPage.vue')
			},
			{
				path: 'settings/',
				component: () => import('pages/Web/Settings/IndexPage.vue')
			},
			{
				path: 'invite-recipient/:org_id/:invite_id',
				component: () => import('pages/Items/InviteRecipient.vue')
			},
			{
				path: 'org/:org_mode',
				component: () => import('pages/Web/Orgs/OrgIndexPage.vue')
			},
			{
				path: 'org/:org_mode/:org_type',
				component: () => import('pages/Web/Orgs/OrgIndexPage.vue')
			},
			{
				path: 'settings/:mode',
				component: () => import('pages/Web/Settings/IndexPage.vue')
			},
			{
				path: 'generator/',
				component: () => import('pages/Web/Generator.vue')
			},
			{
				path: 'security/',
				component: () => import('pages/Web/Security/IndexPage.vue')
			}
		]
	},
	{
		path: '/:catchAll(.*)*',
		component: () => import('pages/ErrorNotFound.vue')
	}
];
export default desktop;
