import axios from 'axios';
import { DownloadProgress } from '../../../pages/Mobile/collect/utils';
import { useCollectStore } from '../../../stores/collect';

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
		console.log(entry);
		return entry;
	} catch (e: any) {
		console.log(e.message);
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
		console.log(progress);
		return progress;
	} catch (e: any) {
		console.log(e.message);
		return null;
	}
}
