import { i18n } from '../boot/i18n';

interface SettingType {
	icon: string;
	mode: number;
	name: string;
}

export const SETTING_MENU: Record<string, SettingType> = {
	account: {
		icon: 'person',
		mode: 1,
		name: i18n.global.t('web.settings.account.title')
	},
	security: {
		icon: 'security',
		mode: 2,
		name: i18n.global.t('web.settings.security.title')
	},
	display: {
		icon: 'desktop_windows',
		mode: 3,
		name: i18n.global.t('web.settings.display.title')
	},
	tools: {
		icon: 'construction',
		mode: 4,
		name: i18n.global.t('web.settings.tools.title')
	},
	rebinding: {
		icon: 'person',
		mode: 5,
		name: i18n.global.t('web.settings.rebinding.title')
	}
};

export const PASSWORD_RULE = {
	LENGTH_RULE: '^.{8,32}$',
	LOWERCASE_RULE: '^(?=.*[a-z])',
	UPPERCASE_RULE: '^(?=.*[A-Z])',
	DIGIT_RULE: '^(?=.*[0-9])',
	SYMBOL_RULE: '^(?=.*[@$!%*?&_.])',
	ALL_RULE:
		'^(?=.*[@$!%*?&_.])(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])[A-Za-z0-9@$!%*?&_.]{8,32}$'
};

export enum TERMINUS_VC_TYPE {
	GOOGLE = 'Google',
	TWITTER = 'Twitter',
	FACEBOOK = 'Facebook',
	CHANNEL = 'Channel'
}

export enum ConfirmButtonStatus {
	normal = 1,
	error = 2,
	disable = 3
}

export interface TabbarItem {
	name: string;
	identify: any;
	normalImage: string;
	activeImage: string;
	to: string;
}

export interface LayoutItem {
	name: string;
	icon: string;
	icon_active: string;
	identify: LayoutMenuIdetify;
	path: string;
}

export enum LayoutMenuIdetify {
	FILES = 'files',
	VAULT = 'vault',
	TRANSMISSION = 'transmission',
	SYSTEM_SETTINGS = 'system_settings',
	ACCOUNT_CENTER = 'account_center'
}

export const LayoutMenu: LayoutItem[] = [
	{
		name: i18n.global.t('file'),
		icon: 'files',
		icon_active: 'files-active',
		identify: LayoutMenuIdetify.FILES,
		path: '/Files/Home/'
	},

	{
		name: i18n.global.t('vault'),
		icon: 'vault',
		icon_active: 'vault-active',
		identify: LayoutMenuIdetify.VAULT,
		path: '/items'
	},
	{
		name: i18n.global.t('transmission.title'),
		icon: 'transfer',
		icon_active: 'transfer-active',
		identify: LayoutMenuIdetify.TRANSMISSION,
		path: '/transmission'
	}
];

const name = 'Files';
const disableExternal = false;
const baseURL = window.location.origin;
const staticURL = '';
const signup = false;
const version = '0.1';
const logoURL = staticURL + '/img/logo.svg';
const noAuth = true;
const authMethod = 'json';
const loginPage = false;
const theme = 'light';
const enableThumbs = true;
const resizePreview = true;
const enableExec = false;
const origin = window.location.origin;
const fileList = [
	'avi',
	'doc',
	'docx',
	'gif',
	'png',
	'jpeg',
	'jpg',
	'mp3',
	'mp4',
	'pdf',
	'txt',
	'xls',
	'xlsx',
	'webp'
];

export enum SortTpe {
	name = 'name',
	size = 'size',
	type = 'type',
	modified = 'modify'
}

export {
	name,
	disableExternal,
	baseURL,
	logoURL,
	signup,
	version,
	noAuth,
	authMethod,
	loginPage,
	theme,
	enableThumbs,
	resizePreview,
	enableExec,
	origin,
	fileList
};
