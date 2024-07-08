import { RouteRecordRaw } from 'vue-router';

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
				component: () => import('src/pages/Mobile/vault/ItemIndex.vue')
			},
			{
				path: 'items/:itemid',
				component: () => import('src/pages/Mobile/vault/ItemView.vue')
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
				component: () =>
					import('src/pages/Mobile/setting/BackupMnemonicsPage.vue')
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
			},
			{
				path: '/integration',
				component: () =>
					import('src/pages/Mobile/integration/IntegrationPage.vue')
			},
			{
				path: '/integration/add',
				component: () =>
					import('src/pages/Mobile/integration/IntegrationAddPage.vue')
			},
			{
				path: '/integration/common/detail/:type/:name?',
				component: () =>
					import('src/pages/Mobile/integration/IntegrationDetailPage.vue')
			},
			{
				path: '/integration/aws/add',
				component: () =>
					import('src/pages/Mobile/integration/aws/AwsAddIntegrationPage.vue')
			}
		]
	}
];

export default mobileCommon;
