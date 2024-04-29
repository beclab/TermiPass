import enUS from './en-US';
import zhCN from './zh-CN';

export default {
	'en-US': enUS,
	'zh-CN': zhCN
};

export const defaultLanguage = 'en-US';

export const supportLanguages = [
	{ value: 'en-US', label: 'English' },
	{ value: 'zh-CN', label: '简体中文' }
];

export type supportLanguageType = 'en-US' | 'zh-CN' | undefined;
