import { WebPlugin } from '@capacitor/core';
import { DownloadFilePlugin } from './definitions';

export class DownloadFileWeb extends WebPlugin implements DownloadFilePlugin {
	resole: any;
	constructor() {
		super({
			name: 'DownloadFile',
			platforms: ['web']
		});
	}

	async download(options: {
		url: string;
		name: string;
		id: string;
		force: boolean;
	}) {
		window.open(options.url);
		return {
			status: true,
			path: '',
			saveStatus: false
		};
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async isDownloaded(_options: {
		name: string;
		id: string;
	}): Promise<{ status: boolean; path: string }> {
		return {
			status: false,
			path: ''
		};
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async updateDownloadSavePathByNewName(_options: {
		name: string;
		id: string;
		newName: string;
	}): Promise<{ status: boolean; path: string; saveStatus: boolean }> {
		return {
			status: true,
			path: '',
			saveStatus: false
		};
	}
}
