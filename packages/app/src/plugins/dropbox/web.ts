import { WebPlugin } from '@capacitor/core';
import { DropboxAuthPluginInterface, DropboxAuthResult } from './definitions';
// import { Dialog } from 'quasar';

export class DropboxWeb
	extends WebPlugin
	implements DropboxAuthPluginInterface
{
	resole: any;
	constructor() {
		super({
			name: 'DropboxPlugin',
			platforms: ['web']
		});
	}
	initialize(): Promise<void> {
		return new Promise((resolve) => {
			resolve();
		});
	}
	signIn(): Promise<DropboxAuthResult> {
		return new Promise((resolve) => {
			resolve({
				accessToken: '',
				uid: ''
			});
		});
	}
}
