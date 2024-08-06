import { DefaultType } from 'src/utils/utils';

export type Message =
	| { type: 'getAllRSS'; tabId: number }
	| { type: 'setPageRSS'; feeds: any }
	| {
			type: 'addPageRSS';
			feed: { url: string; title: string; image: string };
	  };

export const rsshubDomain = '{rsshubDomain}';
export const rsshubReplaceDomain = 'http://127.0.0.1:3010/rss';

export interface FileInfo {
	file: string;
	file_type: string;
	download_url: string;
}

export interface DownloadRecord {
	created_time: string;
	download_app: string;
	download_provdider: string;
	enclosure_id: string;
	entry_id: string;
	file_type: string;
	finished_download_time: string;
	id: number;
	input_extra: string;
	link_type: string;
	name: string;
	output_extra: string;
	path: string;
	progress: number;
	downloaded_bytes: string;
	provider_task_id: string;
	size: number;
	status: DOWNLOAD_RECORD_STATUS;
	task_user: string;
	update_time: string;
	url: string;
}

export interface DownloadFileRecord {
	file: FileInfo;
	record?: DownloadRecord;
	title: string;
}

export const CompareDownloadRecord = (a: DownloadRecord, b: DownloadRecord) => {
	const aTimestamp = new Date(a.created_time).getTime();
	const bTimestamp = new Date(b.created_time).getTime();
	if (aTimestamp > bTimestamp) {
		return -1;
	} else if (aTimestamp < bTimestamp) {
		return 1;
	} else {
		return a.id < b.id ? -1 : 1;
	}
};

export class DownloadRecordRequest {
	offset: number;
	limit: number;
	entry_id: string | undefined;
	task_id: string | undefined;
	enclosure_id: string | undefined;

	constructor(
		entry_id?: string,
		task_id?: string,
		enclosure_id?: string,
		offset = 0,
		limit = DefaultType.Limit
	) {
		this.offset = offset;
		this.limit = limit;
		this.entry_id = entry_id;
		this.task_id = task_id;
		this.enclosure_id = enclosure_id;
	}

	toString() {
		let url = '?';
		if (this.entry_id) {
			url = url + 'entry_id=' + this.entry_id + '&';
		} else if (this.task_id) {
			url = url + 'task_id=' + this.task_id + '&';
		} else if (this.enclosure_id) {
			url = url + 'enclosure_id=' + this.enclosure_id + '&';
		}
		return url + 'offset=' + this.offset + '&limit=' + this.limit;
	}
}

export enum DOWNLOAD_RECORD_STATUS {
	COMPLETE = 'complete',
	ERROR = 'error',
	DOWNLOADING = 'downloading',
	WAITING = 'waiting',
	PAUSED = 'paused',
	REMOVE = 'remove'
}
