import { TerminusCommonPlatform } from './terminalCommonPlatform';
import { i18n } from '../../boot/i18n';

export class MobileWebPlatform extends TerminusCommonPlatform {
	tabbarItems = [
		{
			name: i18n.global.t('file'),
			identify: 'file',
			normalImage: 'tab_files_normal',
			activeImage: 'tab_files_active',
			to: '/home'
		},
		{
			name: i18n.global.t('vault'),
			identify: 'secret',
			normalImage: 'tab_secret_normal',
			activeImage: 'tab_secret_active',
			to: '/secret'
		},
		{
			name: 'Integration',
			identify: 'integration',
			normalImage: 'tab_secret_normal',
			activeImage: 'tab_secret_active',
			to: '/integration'
		},
		{
			name: i18n.global.t('setting'),
			identify: 'setting',
			normalImage: 'tab_setting_normal',
			activeImage: 'tab_setting_active',
			to: '/setting'
		}
	];

	async homeMounted(): Promise<void> {
		await super.homeMounted();
	}

	isMobile = true;
}
