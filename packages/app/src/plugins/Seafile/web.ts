/* eslint-disable @typescript-eslint/no-unused-vars */

import { WebPlugin } from '@capacitor/core';

import { SeafilePlugin } from './definitions';
import { getContentUrlByPath } from '../../api/drive/drive';

export enum SeaHubType {
	file = 'file',
	dir = 'dir'
}
export interface SeaFile {
	id: string;
	mtime: number;
	name: string;
	parent_dir: string;
	permission: string;
	starred: false;
	type: SeaHubType;
}
export class SeafileWebPlugin extends WebPlugin implements SeafilePlugin {
	resole: any;

	constructor() {
		super({
			name: 'SeafilePlugin',
			platforms: ['web']
		});
	}

	startTransfer(): void {
		throw new Error('Method not implemented.');
	}
	setUser(_options: {
		server: string;
		name: string;
		email: string;
		token: string;
	}): void {
		throw new Error('Method not implemented.');
	}
	downloadFiles(_options: {
		repoId: string;
		repoName: string;
		dirPath: string;
		dirents: SeaFile[];
	}): void {
		throw new Error('Method not implemented.');
	}
	async downloadFile(options: {
		repoId: string;
		repoName: string;
		dirPath: string;
		fileName: string;
	}): Promise<void> {
		const downloadPath = options.dirPath + options.fileName;

		const downloadFileUrl = await getContentUrlByPath(downloadPath);

		if (downloadFileUrl) {
			window.open(downloadFileUrl);
		}
	}
	uploadFile(_options: {
		names: string[];
		repoId: string;
		repoName: string;
		dirPath: string;
		dirID: string;
		dirPermission: string;
	}): void {
		throw new Error('Method not implemented.');
	}
	getCacheFile(_options: {
		repoId: string;
		repoName: string;
		path: string;
		fileID: string;
	}): Promise<{ path: string }> {
		throw new Error('Method not implemented.');
	}
	openLocalFile(_options: {
		repoId: string;
		repoName: string;
		path: string;
		fileID: string;
	}): void {
		throw new Error('Method not implemented.');
	}
}
