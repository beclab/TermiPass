import { FileItem, FileResType } from './../stores/files';
import { CopyStoragesType } from 'src/stores/operation';

import { OPERATE_ACTION } from '../utils/contact';

import { DriveMenuType } from './drive/type';
import { SyncRepoMineType } from './sync/type';

export abstract class Origin {
	/**
	 * Retry timer when uplaod
	 */
	public RETRY_TIMER = 3;

	/**
	 * Chunk size when uplaod
	 */
	public SIZE = 8 * 1024 * 1024;

	/**
	 * Breadcrumbs base
	 */
	abstract breadcrumbsBase: string;

	/**
	 * This function retrieves the data from all files in the specified directory.
	 */
	abstract fetch(url: string): Promise<FileResType>;

	/**
	 * Retrieves this menu from the Sync
	 */
	abstract fetchMenuRepo(
		menu?: string
	): Promise<DriveMenuType[] | SyncRepoMineType[]>;

	/**
	 * get download files url info
	 */
	abstract download(path: string): Promise<{ url: string; headers: any }>;

	/**
	 * download file
	 */
	abstract downloadFile(fileUrl: any, filename: string): Promise<void>;

	/**
	 * This function handles the copying of files or directories in an event
	 */
	abstract copy(): Promise<CopyStoragesType[]>;

	/**
	 * Cut
	 */
	abstract cut(): Promise<CopyStoragesType[]>;

	/**
	 * Paste
	 */
	abstract paste(
		route: string,
		callback: (action: OPERATE_ACTION, data: any) => Promise<void>
	): Promise<void>;

	/**
	 * Move
	 */
	abstract move(
		path: string,
		callback: (action: OPERATE_ACTION, data: any) => Promise<void>
	): Promise<void>;

	/**
	 * Event middleware
	 */
	abstract action(
		overwrite: boolean | undefined,
		rename: boolean | undefined,
		items: CopyStoragesType[],
		path: string,
		isMove: boolean | undefined,
		callback: (action: OPERATE_ACTION, data: any) => Promise<void>
	): Promise<void>;

	/**
	 * Upload files
	 */
	abstract uploadFiles(): void;

	/**
	 * Upload folder
	 */
	abstract uploadFolder(): void;

	/**
	 * Open local folder
	 */
	abstract openLocalFolder(): string | undefined;

	/**
	 * Open preview when upload modal
	 */
	abstract openPreview(item: any): Promise<FileResType>;

	/**
	 * get url for preview page
	 */
	abstract getPreviewURL(res: any, thumb: string): string;

	/**
	 * get DownloadURL url for preview page
	 */
	abstract getDownloadURL(
		file: any,
		inline?: boolean,
		download?: boolean
	): string;

	/**
	 * Format File Content for 'audio', 'video', 'text', 'txt', 'textImmutable', 'pdf'
	 */
	abstract formatFileContent(file: FileItem): Promise<FileItem>;

	/**
	 * format Repo to Path
	 */
	abstract formatRepotoPath(item?: any): Promise<string>;

	/**
	 * format path to url
	 */
	abstract formatPathtoUrl(path: string, param?: string): Promise<string>;

	/**
	 * Handle Delete Item
	 */
	abstract deleteItem(item: FileItem[]): Promise<void>;

	/**
	 * Handle Rename Item
	 */
	abstract renameItem(item: FileItem, newName: string): Promise<void>;

	/**
	 * Handle Create New Dir
	 */
	abstract createDir(dirName: string, path: string): Promise<void>;

	/**
	 * Upload fetch
	 */
	// abstract fetchUploader(
	// 	url: string,
	// 	content: string,
	// 	overwrite: boolean,
	// 	timer: number,
	// 	callback?: () => Promise<void>
	// ): Promise<any>;
}
