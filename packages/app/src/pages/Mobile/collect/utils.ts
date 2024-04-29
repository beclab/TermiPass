export interface CollectBaseInfo {
	title: string;
	detail: string;
	logo: string;
}

export enum PageStatus {
	none,
	error,
	loading,
	cancel,
	success
}

export interface PageInfo extends CollectBaseInfo {
	status: PageStatus;
	progress?: any; // 0-1
}

export enum RssStatus {
	none,
	added,
	removed
}

export interface RssInfo extends CollectBaseInfo {
	status: RssStatus;
}

export enum PDFStatus {
	none,
	loading,
	error,
	success
}

export interface PDFInfo extends CollectBaseInfo {
	status: PDFStatus;
	progress?: any; // 0-1
}
