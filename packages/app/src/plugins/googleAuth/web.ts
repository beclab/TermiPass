import { WebPlugin } from '@capacitor/core';
import { GoogleAuthPluginInterface } from './definitions';
import {
	Authentication,
	GoogleAuth,
	InitOptions,
	User
} from '@codetrix-studio/capacitor-google-auth';

export class GoogleAuthWeb
	extends WebPlugin
	implements GoogleAuthPluginInterface
{
	resole: any;
	constructor() {
		super({
			name: 'GoogleAuthWebPlugin',
			platforms: ['web']
		});
	}
	async refresh(): Promise<Authentication> {
		// throw new Error('Method not implemented.');
		return await GoogleAuth.refresh();
	}
	async signOut(): Promise<any> {
		// throw new Error('Method not implemented.');
		return await GoogleAuth.signOut();
	}
	async initialize(options?: InitOptions): Promise<void> {
		return GoogleAuth.initialize(options);
	}
	async signIn(): Promise<User> {
		return await GoogleAuth.signIn();
	}
}
