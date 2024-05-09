import axios from 'axios';
import { DownloadProgress } from '../pages/Mobile/collect/utils';
import { useUserStore } from '../stores/user';

export async function downloadPdf(
	url: string,
	filename: string
): Promise<any | null> {
	try {
		const userStore = useUserStore();
		const baseUrl = userStore.getModuleSever('wise');
		const entry = await axios.post(baseUrl + '/knowledge/pdf/download', {
			url,
			filename
		});
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
		const userStore = useUserStore();
		const baseUrl = userStore.getModuleSever('wise');
		const progress: DownloadProgress = await axios.get(
			baseUrl + '/knowledge/pdf/download/progress/' + id
		);
		console.log(progress);
		return progress;
	} catch (e: any) {
		console.log(e.message);
		return null;
	}
}
