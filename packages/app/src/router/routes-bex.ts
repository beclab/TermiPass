import { RouteRecordRaw } from 'vue-router';
import PluginRootLayout from 'layouts/PluginRootLayout.vue';
import PluginMainLayout from 'layouts/PluginMainLayout.vue';
import PluginIndexPage from 'pages/Plugin/indexPage.vue';
import PluginItemIndex from 'src/pages/Mobile/vault/ItemIndex.vue';
import PluginItemView from 'src/pages/Mobile/vault/ItemView.vue';
import PluginSettingIndex from 'pages/Mobile/setting/SettingIndex.vue';
// import PluginRssIndexPage from 'pages/Mobile/rss/RssIndexPage.vue';

import MobileLoginLayout from 'layouts/MobileLoginLayout.vue';
import WelcomePage from 'src/pages/Mobile/login/WelcomePage.vue';
import SetUnlockPwd from 'src/pages/Mobile/login/unlock/SetUnlockPwd.vue';
import UnlockPage from 'src/pages/Mobile/login/unlock/UnlockPage.vue';
import BindTerminusVC from 'src/pages/Mobile/login/vc/BindTerminusVC.vue';
import BindCustomerVC from 'src/pages/Mobile/login/vc/BindCustomerVC.vue';
import BindOrgVC from 'src/pages/Mobile/login/vc/BindOrgVC.vue';
import BindVCSuccess from 'src/pages/Mobile/login/vc/BindVCSuccess.vue';
import SetupAccount from 'src/pages/Mobile/login/account/SetupAccount.vue';
import AndroidAutoFillList from 'src/pages/Mobile/android/AndroidAutoFillList.vue';
import InputMnemonic from 'pages/Mobile/login/account/InputMnemonic.vue';
import ConnectLoading from 'src/pages/Mobile/connect/ConnectLoading.vue';
import ActivateTerminus from 'src/pages/Mobile/connect/activate/ActivateTerminus.vue';
import ActivateWizard from 'src/pages/Mobile/connect/activate/ActivateWizard.vue';
import ResetPassword from 'src/pages/Mobile/connect/activate/ResetPassword.vue';
import ScanPage from 'src/pages/Mobile/connect/activate/ScanPage.vue';
import ScanLocalPage from 'src/pages/Mobile/connect/activate/ScanLocalPage.vue';
import ReLogin from 'src/pages/Mobile/connect/ReLogin.vue';
import ConnectTerminus from 'src/pages/Mobile/connect/ConnectTerminus.vue';
import DomainDetail from 'src/pages/Mobile/cloud/domain/DomainDetail.vue';
import CloudDomainManage from 'src/pages/Mobile/cloud/domain/CloudDomainManage.vue';
import JoinOrganizationPage from 'src/pages/Mobile/login/vc/JoinOrganizationPage.vue';
import BindVCIntroduce from 'src/pages/Mobile/login/vc/BindVCIntroduce.vue';

import MobileMainLayout from 'layouts/MobileMainLayout.vue';
import VCCard from 'pages/Mobile/vc/card/VCCard.vue'; //error customElements.define("verifiable-credential",fi)
import ItemIndex from 'pages/Mobile/vault/ItemIndex.vue';
import ItemView from 'pages/Mobile/vault/ItemView.vue';
import Generator from 'pages/Web/Generator.vue';
import IndexPage from 'pages/Web/Security/IndexPage.vue';
import InviteRecipient from 'pages/Items/InviteRecipient.vue';
import OrgIndex from 'src/pages/Mobile/vault/OrgIndex.vue';
import OrgView from 'src/pages/Mobile/vault/OrgView.vue';
import SettingIndex from 'pages/Mobile/setting/SettingIndex.vue';
// import FilesPage from 'pages/Mobile/file/FilesPage.vue'; // error pinia not active
import FileRootPage from 'pages/Mobile/file/FileRootPage.vue';
import AccountList from 'pages/Mobile/AccountList.vue';
import AddVCPage from 'pages/Mobile/secret/AddVCPage.vue';
import VCCardList from 'src/pages/Mobile/secret/VCCardList.vue';
import AccountPage from 'pages/Mobile/setting/AccountPage.vue';
import DisplayPage from 'pages/Mobile/setting/DisplayPage.vue';
import SecurityPage from 'pages/Mobile/setting/SecurityPage.vue';
import AutoFillPage from 'pages/Mobile/setting/AutoFillPage.vue';
import WebsiteManagerPage from 'pages/Mobile/setting/WebsiteManagerPage.vue';
import ProfilePage from 'pages/Mobile/ProfilePage.vue';
import ChangePwdPage from 'pages/Mobile/setting/ChangePwdPage.vue';
import BackupMnemonicsPage from 'pages/Mobile/setting/BackupMnemonicsPage.vue';
import VCManagePage from 'pages/Mobile/setting/VCManagePage.vue'; //error customElements.define("verifiable-credential",fi)
// import FilePreviewPage from 'pages/Mobile/file/FilePreviewPage.vue'; //error Function("r","regeneratorRuntime = r")
import AuthorizationPage from 'src/pages/Mobile/wallet/AuthorizationPage.vue';
import ConnectPage from 'src/pages/Mobile/wallet/ConnectPage.vue';
import SubmitPage from 'src/pages/Mobile/wallet/SubmitVCInfoPage.vue';
import CollectPage from 'src/pages/Mobile/collect/CollectIndexPage.vue';

const mobile: RouteRecordRaw[] = [
	{
		path: '/',
		component: MobileLoginLayout,
		children: [
			{
				path: '/welcome',
				name: 'welcome',
				component: WelcomePage
			},
			{
				path: '/setUnlockPassword',
				name: 'setUnlockPassword',
				component: SetUnlockPwd
			},
			{
				path: '/unlock',
				name: 'unlock',
				meta: {
					emptyUserDisableBack: true
				},
				component: UnlockPage
			},
			{
				path: 'bind_vc',
				name: 'bindVC',
				meta: {
					noReturn: true
				},
				component: BindTerminusVC
			},
			{
				path: 'bind_customer_vc',
				component: BindCustomerVC
			},
			{
				path: 'bind_org_vc',
				component: BindOrgVC
			},
			{
				path: 'bind_vc_success',
				meta: {
					noReturn: true
				},
				component: BindVCSuccess
			},
			{
				path: 'setup/success',
				name: 'setupSuccess',
				meta: {
					emptyUserDisableBack: true
				},
				component: SetupAccount
			},
			{
				path: 'autoFillList/',
				meta: {
					exit: true
				},
				component: AndroidAutoFillList
			},
			{
				path: 'import_mnemonic',
				name: 'InputMnemonic',
				component: InputMnemonic
			},

			{
				path: 'connectLoading',
				name: 'connectLoading',
				component: ConnectLoading
			},
			{
				path: 'Activate/:disableLeave?',
				meta: {
					noReturn: true
				},
				component: ActivateTerminus
			},

			{
				path: 'ActivateWizard',
				meta: {},
				component: ActivateWizard
			},

			{
				path: 'ResetPassword',
				meta: {},
				component: ResetPassword
			},

			{
				path: 'scan',
				meta: {
					backgroundHide: true
				},
				component: ScanPage
			},
			{
				path: 'scan_local',
				component: ScanLocalPage
			},

			{
				path: 'ReLogin',
				component: ReLogin
			},

			{
				path: 'ConnectTerminus',
				meta: {
					noReturn: true
				},
				component: ConnectTerminus
			},

			{
				path: '/DomainDetail/:base',
				meta: {},
				component: DomainDetail
			},

			{
				path: '/CloudDomainManage',
				meta: {},
				component: CloudDomainManage
			},
			{
				path: 'JoinOrganization',
				component: JoinOrganizationPage
			},
			{
				path: 'BindVCIntroduce/:isPersonal',
				component: BindVCIntroduce
			},
			{
				path: '/authorization',
				component: AuthorizationPage
			},
			{
				path: '/connect',
				component: ConnectPage
			},
			{
				path: '/submit',
				component: SubmitPage
			}
		]
	}
];

const mobileCommon: RouteRecordRaw[] = [
	{
		path: '/',
		component: MobileMainLayout,
		name: 'MobileMainLayout',
		children: [
			{
				path: '/vc/card',
				component: VCCard
			},
			{
				path: 'secret',
				meta: {
					tabIdentify: 'secret'
				},
				component: ItemIndex
			},

			{
				path: 'items',
				meta: {
					tabIdentify: 'secret'
				},
				component: ItemIndex
			},
			{
				path: 'items/:itemid',
				component: ItemView
			},
			{
				path: 'security/',
				component: IndexPage
			},
			{
				path: 'invite-recipient/:org_id/:invite_id',
				component: InviteRecipient
			},
			{
				path: 'setting',
				meta: {
					tabIdentify: 'setting'
				},
				component: SettingIndex
			},
			// {
			// 	path: 'Files/:path*',
			// 	name: 'Files',
			// 	component: FilesPage
			// },
			{
				path: 'file',
				meta: {
					tabIdentify: 'file'
				},
				component: FileRootPage
			},
			{
				path: '/addVC',
				component: AddVCPage
			},
			{
				path: '/VC_card_list',
				component: VCCardList
			},
			{
				path: '/setting/account',
				component: AccountPage
			},
			{
				path: '/setting/display',
				component: DisplayPage
			},
			{
				path: '/setting/security',
				component: SecurityPage
			},
			{
				path: '/setting/autofill',
				component: AutoFillPage
			},
			{
				path: '/setting/website',
				component: WebsiteManagerPage
			},
			{
				path: '/profile',
				component: ProfilePage
			},
			{
				path: '/change_pwd',
				name: 'changePwd',
				component: ChangePwdPage
			},
			{
				path: '/backup_mnemonics',
				name: 'backupMnemonics',
				component: BackupMnemonicsPage
			},
			{
				path: '/vc_manage',
				name: 'vcManage',
				component: VCManagePage
			}
			// {
			// 	path: 'file_preview_view',
			// 	name: 'filePreviewView',
			// 	component: FilePreviewPage
			// }
		]
	}
];

const bex: RouteRecordRaw[] = [
	{
		path: '/',
		component: PluginMainLayout,
		children: [
			{
				path: '/home',
				meta: {
					tabIdentify: 'home'
				},
				component: PluginIndexPage
			},
			{
				path: '/items',
				meta: {
					tabIdentify: 'vault'
				},
				component: PluginItemIndex
			},
			{
				path: '/items/:itemid',
				component: PluginItemView
			},
			{
				path: '/setting',
				component: PluginSettingIndex
			},
			{
				path: '/collect',
				meta: {
					tabIdentify: 'collect'
				},
				component: CollectPage
			},
			{
				path: 'org/:org_mode',
				meta: {
					tabIdentify: 'vault'
				},
				component: OrgIndex
			},
			{
				path: 'org/:org_mode/:org_type',
				meta: {
					tabIdentify: 'vault'
				},
				component: OrgView
			},
			{
				path: 'generator/',
				meta: {
					tabIdentify: 'vault'
				},
				component: Generator
			},
			{
				path: '/accounts',
				name: 'accounts',
				meta: {
					noReturn: true
				},
				component: AccountList
			}
		]
	}
];

const routes: RouteRecordRaw[] = [
	{
		path: '/',
		component: PluginRootLayout,
		children: [
			{
				path: '/bex',
				children: bex
			},
			{
				path: '/mobile',
				children: mobile
			},
			{
				path: '/mobileCommon',
				children: mobileCommon
			}
		]
	}
];

export default routes;
