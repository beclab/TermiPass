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

export default mobile;
