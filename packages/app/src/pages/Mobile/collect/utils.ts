export interface BaseCollectInfo {
	id?: string;
	title: string;
	url: string;
	image: string;
}

export enum PageStatus {
	none,
	error,
	loading,
	cancel,
	success
}

export interface PageInfo extends BaseCollectInfo {
	status: PageStatus;
	progress?: any; // 0-1
}

export enum RssStatus {
	none,
	added,
	removed
}

export interface RssInfo extends BaseCollectInfo {
	status: RssStatus;
}

export enum PDFStatus {
	none,
	loading,
	error,
	success
}

export interface PDFInfo extends BaseCollectInfo {
	status: PDFStatus;
	progress?: DownloadProgress; // 0-1
}

export interface DownloadProgress {
	id: string;
	url: string;
	fileName: string;
	status: string;
	total: number;
	download: number;
	//local data
	isLoading: boolean;
}

export enum DOWNLOAD_STATUS {
	SUCCESS = 'success',
	FAILED = 'failed',
	DOWNLOADING = 'downloading',
	//font
	UNKNOWN = 'unknown'
}
