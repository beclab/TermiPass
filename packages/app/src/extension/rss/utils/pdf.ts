import axios from 'axios';
import { DownloadProgress } from '../../../pages/Mobile/collect/utils';
import { useCollectStore } from '../../../stores/collect';
import { useUserStore } from 'src/stores/user';
import { DownloadRecord, DownloadRecordRequest, FileInfo } from '.';
import { notifyFailed } from 'src/utils/notifyRedefinedUtil';

export async function queryPdfEntry(url: string) {
	const collectStore = useCollectStore();
	try {
		const response: any = await axios.post(
			collectStore.baseUrl + '/knowledge/entry/query',
			{
				url,
				source: 'termipass',
				file_type: 'pdf'
			}
		);
		return !!(response && response.count > 0);
	} catch (e) {
		return false;
	}
}

export async function downloadPdf(
	url: string,
	filename: string
): Promise<any | null> {
	try {
		const collectStore = useCollectStore();
		const entry = await axios.post(
			collectStore.baseUrl + '/knowledge/pdf/download',
			{
				url,
				filename
			}
		);
		return entry;
	} catch (e: any) {
		return null;
	}
}

export async function getDownloadPdfProgress(
	id: string
): Promise<DownloadProgress | null> {
	try {
		const collectStore = useCollectStore();
		const progress: DownloadProgress = await axios.get(
			collectStore.baseUrl + '/knowledge/pdf/download/progress/' + id
		);
		return progress;
	} catch (e: any) {
		return null;
	}
}

export async function queryDownloadFile(url: string) {
	const collectStore = useCollectStore();
	if (!collectStore.baseUrl) {
		// collectStore.baseUrl =
		const userStore = useUserStore();
		collectStore.baseUrl = userStore.getModuleSever('wise');
	}
	try {
		const response: any = await axios.get(
			collectStore.baseUrl + '/knowledge/download/download_file_query',
			{
				params: {
					url
				}
			}
		);
		console.log('response ===>', response);
		// response;
		return response; //!!(response && response.count > 0);
	} catch (e) {
		return undefined;
	}
}

export async function downloadFile(
	fileInfo: FileInfo
): Promise<DownloadRecord | undefined> {
	try {
		const collectStore = useCollectStore();
		const file: DownloadRecord[] = await axios.post(
			collectStore.baseUrl + '/knowledge/download/file_download',
			{
				url: fileInfo.download_url,
				name: fileInfo.file,
				file_type: fileInfo.file_type
			}
		);
		return file[0];
	} catch (e: any) {
		console.log(e.message);
		notifyFailed(e.message);
		return undefined;
	}
}

export async function getDownloadHistory(
	req: DownloadRecordRequest
): Promise<DownloadRecord[]> {
	try {
		const collectStore = useCollectStore();
		const history: DownloadRecord[] = await axios.get(
			collectStore.baseUrl + '/knowledge/download/task_query' + req.toString()
		);
		console.log(history);
		return history;
	} catch (e: any) {
		console.log(e.message);
		return [];
	}
}
