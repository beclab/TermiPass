import { dataAPIs } from './../index';

export async function fetchRepo(): Promise<any[]> {
	const dataAPI = dataAPIs();
	const res: any = await dataAPI.commonAxios.post('/drive/accounts', {});

	const repos: any[] = res.data.data;
	return repos;
}
