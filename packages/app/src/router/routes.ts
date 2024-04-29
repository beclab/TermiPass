import { RouteRecordRaw } from 'vue-router';

const mobile: RouteRecordRaw[] = [
	{
		path: '/',
		component: () => import('layouts/MobileLoginLayout.vue'),
		children: [
			{
				path: '/welcome',
				name: 'welcome',
				component: () => import('src/pages/Mobile/login/WelcomePage.vue')
			},
			{
				path: '/setUnlockPassword',
				name: 'setUnlockPassword',
				component: () =>
					import('src/pages/Mobile/login/unlock/SetUnlockPwd.vue')
			},
			{
				path: '/unlock',
				name: 'unlock',
				meta: {
					emptyUserDisableBack: true
				},
				component: () => import('src/pages/Mobile/login/unlock/UnlockPage.vue')
			},
			{
				path: 'bind_vc',
				name: 'bindVC',
				meta: {
					noReturn: true
				},
				component: () => import('src/pages/Mobile/login/vc/BindTerminusVC.vue')
			},
			{
				path: 'bind_customer_vc',
				component: () => import('src/pages/Mobile/login/vc/BindCustomerVC.vue')
			},
			{
				path: 'bind_org_vc',
				component: () => import('src/pages/Mobile/login/vc/BindOrgVC.vue')
			},
			{
				path: 'bind_vc_success',
				meta: {
					noReturn: true
				},
				component: () => import('src/pages/Mobile/login/vc/BindVCSuccess.vue')
			},
			{
				path: 'setup/success',
				name: 'setupSuccess',
				meta: {
					emptyUserDisableBack: true
				},
				component: () =>
					import('src/pages/Mobile/login/account/SetupAccount.vue')
			},
			{
				path: 'autoFillList/',
				meta: {
					exit: true
				},
				component: () =>
					import('src/pages/Mobile/android/AndroidAutoFillList.vue')
			},
			{
				path: 'import_mnemonic',
				name: 'InputMnemonic',
				component: () => import('pages/Mobile/login/account/InputMnemonic.vue')
			},

			{
				path: 'connectLoading',
				name: 'connectLoading',
				component: () => import('src/pages/Mobile/connect/ConnectLoading.vue')
			},
			{
				path: 'Activate/:disableLeave?',
				meta: {
					noReturn: true
				},
				component: () =>
					import('src/pages/Mobile/connect/activate/ActivateTerminus.vue')
			},
			{
				path: 'ActivateWizard',
				meta: { noReturn: true },
				component: () =>
					import('src/pages/Mobile/connect/activate/ActivateWizard.vue')
			},

			{
				path: 'ResetPassword',
				meta: {},
				component: () =>
					import('src/pages/Mobile/connect/activate/ResetPassword.vue')
			},

			{
				path: 'scan',
				meta: {
					backgroundHide: true
				},
				component: () =>
					import('src/pages/Mobile/connect/activate/ScanPage.vue')
			},
			{
				path: 'scan_local',
				component: () =>
					import('src/pages/Mobile/connect/activate/ScanLocalPage.vue')
			},

			{
				path: 'ReLogin',
				component: () => import('src/pages/Mobile/connect/ReLogin.vue')
			},

			{
				path: 'ConnectTerminus',
				meta: {
					noReturn: true
				},
				component: () => import('src/pages/Mobile/connect/ConnectTerminus.vue')
			},

			{
				path: '/DomainDetail/:base',
				meta: {},
				component: () =>
					import('src/pages/Mobile/cloud/domain/DomainDetail.vue')
			},

			{
				path: '/CloudDomainManage',
				meta: {},
				component: () =>
					import('src/pages/Mobile/cloud/domain/CloudDomainManage.vue')
			},
			{
				path: 'JoinOrganization',
				component: () =>
					import('src/pages/Mobile/login/vc/JoinOrganizationPage.vue')
			},
			{
				path: '/OrganizationBindVC/:domain',
				component: () =>
					import('src/pages/Mobile/login/vc/OriganizationBindVCPage.vue')
			},
			{
				path: 'BindVCIntroduce/:isPersonal',
				component: () => import('src/pages/Mobile/login/vc/BindVCIntroduce.vue')
			}
		]
	}
];

const mobileCommon: RouteRecordRaw[] = [
	{
		path: '/',
		component: () => import('layouts/MobileMainLayout.vue'),
		name: 'MobileMainLayout',
		children: [
			{
				path: '/vc/card',
				component: () => import('pages/Mobile/vc/card/VCCard.vue')
			},
			{
				path: 'secret',
				meta: {
					tabIdentify: 'secret'
				},
				component: () => import('pages/Mobile/vault/ItemIndex.vue')
			},

			{
				path: 'items',
				meta: {
					tabIdentify: 'secret'
				},
				component: () => import('pages/Mobile/vault/ItemIndex.vue')
			},
			{
				path: 'items/:itemid',
				component: () => import('pages/Mobile/vault/ItemView.vue')
			},

			{
				path: 'generator/',
				component: () => import('pages/Web/Generator.vue')
			},
			{
				path: 'security/',
				component: () => import('pages/Web/Security/IndexPage.vue')
			},
			{
				path: 'invite-recipient/:org_id/:invite_id',
				component: () => import('pages/Items/InviteRecipient.vue')
			},
			{
				path: 'org/:org_mode',
				meta: {
					tabIdentify: 'secret'
				},
				component: () => import('pages/Mobile/vault/OrgIndex.vue')
			},
			{
				path: 'org/:org_mode/:org_type',
				meta: {
					tabIdentify: 'secret'
				},
				component: () => import('pages/Mobile/vault/OrgView.vue')
			},

			{
				path: 'setting',
				meta: {
					tabIdentify: 'setting'
				},
				component: () => import('pages/Mobile/setting/SettingIndex.vue')
			},

			{
				path: 'Files/:path*',
				name: 'Files',
				component: () => import('pages/Mobile/file/FilesPage.vue')
			},
			{
				path: 'file',
				meta: {
					tabIdentify: 'file'
				},
				component: () => import('pages/Mobile/file/FileRootPage.vue')
			},

			{
				path: '/accounts',
				name: 'accounts',
				meta: {
					noReturn: true
				},
				component: () => import('pages/Mobile/AccountList.vue')
			},
			{
				path: '/addVC',
				component: () => import('pages/Mobile/secret/AddVCPage.vue')
			},
			{
				path: '/VC_card_list',
				component: () => import('pages/Mobile/secret/VCCardList.vue')
			},
			{
				path: '/select_terminus_name',
				component: () => import('pages/Mobile/secret/SelectTerminusName.vue')
			},
			{
				path: '/setting/account',
				component: () => import('pages/Mobile/setting/AccountPage.vue')
			},
			{
				path: '/setting/display',
				component: () => import('pages/Mobile/setting/DisplayPage.vue')
			},
			{
				path: '/setting/security',
				component: () => import('pages/Mobile/setting/SecurityPage.vue')
			},
			{
				path: '/setting/autofill',
				component: () => import('pages/Mobile/setting/AutoFillPage.vue')
			},
			{
				path: '/setting/website',
				component: () => import('pages/Mobile/setting/WebsiteManagerPage.vue')
			},
			{
				path: '/profile',
				component: () => import('pages/Mobile/ProfilePage.vue')
			},
			{
				path: '/change_pwd',
				name: 'changePwd',
				component: () => import('pages/Mobile/setting/ChangePwdPage.vue')
			},
			{
				path: '/backup_mnemonics',
				name: 'backupMnemonics',
				component: () => import('pages/Mobile/setting/BackupMnemonicsPage.vue')
			},
			{
				path: '/vc_manage',
				name: 'vcManage',
				component: () => import('pages/Mobile/setting/VCManagePage.vue')
			},
			{
				path: 'file_preview_view',
				name: 'filePreviewView',
				component: () => import('pages/Mobile/file/FilePreviewPage.vue')
			},
			{
				path: 'LoginCloud',
				component: () => import('src/pages/Mobile/cloud/login/IndexMobile.vue')
			},
			{
				path: '/scanQrCode',
				component: () => import('src/pages/Mobile/ScanQRCodePage.vue')
			},
			{
				path: '/space_management',
				component: () =>
					import('src/pages/Mobile/setting/SpaceManagementPage.vue')
			},
			{
				path: '/checkHistory',
				component: () =>
					import('src/pages/Mobile/setting/CheckStatusHistory.vue')
			}
		]
	}
];

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

const web: RouteRecordRaw[] = [
	{
		path: '/',
		component: () => import('layouts/WebLoginLayout.vue'),
		children: [
			{
				path: 'error',
				component: () => import('pages/ErrorNotFound.vue')
			},
			{
				path: 'binding',
				component: () => import('pages/Web/BindingPage.vue')
			},
			{
				path: 'import_mnemonic',
				component: () => import('pages/Web/InputMnemonicPage.vue')
			},
			{
				path: 'setUnlockPassword',
				component: () => import('pages/Web/SetUnlockPwdPage.vue')
			},
			{
				path: 'unlock',
				component: () => import('pages/Web/UnlockPage.vue')
			}
		]
	}
];

const bex: RouteRecordRaw[] = [
	{
		path: '/',
		component: () => import('layouts/PluginMainLayout.vue'),
		children: [
			{
				path: 'home',
				meta: {
					tabIdentify: 'home'
				},
				component: () => import('pages/Plugin/indexPage.vue')
			},
			{
				path: 'items',
				meta: {
					tabIdentify: 'vault'
				},
				component: () => import('pages/Mobile/vault/ItemIndex.vue')
			},
			{
				path: 'items/:itemid',
				component: () => import('pages/Mobile/vault/ItemView.vue')
			},
			{
				path: 'setting',
				component: () => import('pages/Mobile/setting/SettingIndex.vue')
			},
			{
				path: 'rss',
				meta: {
					tabIdentify: 'rss'
				},
				component: () => import('pages/Mobile/rss/RssIndexPage.vue')
			}
		]
	},
	{
		path: '/inject/google/search',
		component: () => import('pages/Plugin/GoogleSearch.vue')
	},
	{
		path: '/inject/youtube/search',
		component: () => import('pages/Plugin/YoutebuSearch.vue')
	}
];

const common: RouteRecordRaw[] = [
	{
		path: '/',
		component: () => import('layouts/MainLayout.vue'),
		children: [
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
	// Always leave this as last one,
	// but you can also remove it
	{
		path: '/:catchAll(.*)*',
		component: () => import('pages/ErrorNotFound.vue')
	}
];

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
				component: () => import('pages/Desktop/SettingsPage/Account.vue')
			},
			{
				path: 'Files/:path*',
				name: 'Files',
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

const files: RouteRecordRaw[] = [
	{
		path: '/',
		component: () => import('../layouts/FilesMainLayout.vue'),
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
				component: () => import('../pages/Files/FilesPage.vue'),
				meta: {
					requiresAuth: true
				}
			},
			{
				path: 'Files/Application/:path*',
				name: 'Application',
				component: () => import('../pages/Files/FilesPage.vue'),
				meta: {
					requiresAuth: true
				}
			},
			{
				path: 'Files/AppData/:path*',
				name: 'AppData',
				component: () => import('../pages/Files/FilesPage.vue'),
				meta: {
					requiresAuth: true
				}
			},
			{
				path: 'Files/Seahub/:path*',
				name: 'Seahub',
				component: () => import('../pages/Files/FilesPage.vue'),
				meta: {
					requiresAuth: true
				}
			}
		]
	}
];

let routes: RouteRecordRaw[] = [];

if (process.env.PLATFORM == 'WEB') {
	routes = [...routes, ...common, ...web];
}
// else if (process.env.PLATFORM == 'BEX') {
// 	routes = [...routes, ...bex, ...mobileCommon];
// }
else if (process.env.PLATFORM == 'MOBILE' || process.env.PLATFORM == 'BEX') {
	routes = [...routes, ...mobile, ...mobileCommon];
	if (process.env.PLATFORM === 'MOBILE') {
		routes = [...routes, ...mobileExtension];
	} else {
		routes = [...bex, ...routes];
	}
} else if (process.env.PLATFORM == 'DESKTOP') {
	routes = [...routes, ...desktop];
} else if (process.env.PLATFORM == 'FILES') {
	routes = [...routes, ...files];
}
export default routes;
