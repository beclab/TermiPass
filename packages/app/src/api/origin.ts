import { OriginType, DriveResType, CopyStoragesType } from './common/encoding';
import { OPERATE_ACTION } from '../utils/contact';
import { Router } from 'vue-router';

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
	 * This function retrieves the data from all files in the specified directory.
	 */
	abstract fetch(url: string): Promise<DriveResType>;

	/**
	 * Retrieves this menu from the Sync
	 */
	abstract fetchSyncRepo(menu: string): Promise<any>;

	/**
	 * Retrieves this menu from the Sync
	 */
	abstract download(path: string): Promise<{ url: string; headers: any }>;

	/**
	 * This function handles the copying of files or directories in an event
	 */
	abstract copy(): Promise<{ items: CopyStoragesType[]; from: OriginType }>;

	/**
	 * Cut
	 */
	abstract cut(): Promise<{ items: CopyStoragesType[]; from: OriginType }>;

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
	abstract openPreview(item: any, Router?: Router): void;

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
	 * Upload fetch
	 */
	// abstract fetchUploader(
	// 	url: string,
	// 	content: string,
	// 	overwrite: boolean,
	// 	timer: number,
	// 	callback: () => Promise<void>
	// ): Promise<any>;
}
