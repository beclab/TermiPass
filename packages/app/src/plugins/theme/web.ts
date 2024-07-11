import { WebPlugin } from '@capacitor/core';
import { ThemePluginInterface } from './definitions';
import { ThemeDefinedMode } from '@bytetrade/ui';
// import { Dark } from 'quasar';

// @ts-ignore
import localStorage from 'localforage/src/localforage';

export class ThemePlugin extends WebPlugin implements ThemePluginInterface {
	systemIsDark(): Promise<{ dark: boolean }> {
		throw new Error('Method not implemented.');
	}
	async get(): Promise<{ theme: ThemeDefinedMode }> {
		const theme = await localStorage.getItem('theme');
		if (theme == undefined) {
			return {
				theme: ThemeDefinedMode.LIGHT
			};
		}
		return {
			theme
		};
	}
	async set(options: { theme: ThemeDefinedMode }) {
		// Dark.set(
		// 	options.theme == ThemeDefinedMode.AUTO
		// 		? 'auto'
		// 		: options.theme == ThemeDefinedMode.DARK
		// );
		await localStorage.setItem('theme', options.theme);
	}
}
