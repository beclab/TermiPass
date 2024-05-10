import { CreateEntry } from '../model/type';
import { useCollectStore } from '../../../stores/collect';
import axios from 'axios';

export async function queryEntry(url: string) {
	const collectStore = useCollectStore();
	try {
		const response: any = await axios.post(
			collectStore.baseUrl + '/knowledge/entry/query',
			{
				url,
				source: 'library'
			}
		);
		console.log(response);
		return !!(response && response.count > 0);
	} catch (e) {
		return false;
	}
}

export const saveEntry = async (req: CreateEntry[]) => {
	const collectStore = useCollectStore();
	try {
		return await axios.post(collectStore.baseUrl + '/knowledge/entry', req);
	} catch (e) {
		return undefined;
	}
};
