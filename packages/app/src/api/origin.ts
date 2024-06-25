import { RouteLocationNormalizedLoaded } from 'vue-router';

import { OriginType, DriveResType, CopyStoragesType } from './common/encoding';
import { OPERATE_ACTION } from '../utils/contact';

export abstract class Origin {
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
	abstract dowload(path: string): Promise<{ url: string; headers: any }>;

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
		route: RouteLocationNormalizedLoaded,
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
}
