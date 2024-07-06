import { useDataStore } from '../stores/data';
import { axiosInstanceProxy } from '../platform/httpProxy';
export interface InitOptionsInterface {
	server: string | undefined;
}

class SeafileAPI {
	server: string | undefined = undefined;
	// server = '/seahub';
	username = '';
	password = '';
	access_token: string;
	req: any;

	init(initOptions: InitOptionsInterface) {
		this.server = initOptions.server;
		this.req = axiosInstanceProxy({
			baseURL: this.server,
			timeout: 1000 * 10
		});
		return this;
	}

	getFileServerUploadLink(
		repoID: string,
		folderPath: string | number | boolean
	) {
		this.configSeafileApi();
		const path = encodeURIComponent(folderPath);

		const url =
			this.server +
			'/seahub/api2/repos/' +
			repoID +
			'/upload-link/?p=' +
			path +
			'&from=web';
		return this.req.get(url);
	}

	getFileUploadedBytes(repoID: string, filePath: any, fileName: any) {
		this.configSeafileApi();
		const url =
			this.server +
			'/seahub/api/v2.1/repos/' +
			repoID +
			'/file-uploaded-bytes/';
		const params = {
			parent_dir: filePath,
			file_name: fileName
		};
		return this.req.get(url, { params: params });
	}

	async getUpdateLink(
		repoID: string,
		folderPath: string | number | boolean
	): Promise<string> {
		this.configSeafileApi();
		const url =
			'/seahub/api2/repos/' +
			repoID +
			'/update-link/?p=' +
			encodeURIComponent(folderPath);
		const response = await this.req.get(url);
		if (response.status === 200) {
			return response.data;
		} else {
			return '';
		}
	}
	configSeafileApi() {
		if (this.server && this.req) {
			return;
		}
		const store = useDataStore();
		const baseURL = store.baseURL();
		this.init({ server: baseURL });
	}
}

const seafileAPI = new SeafileAPI();
export { seafileAPI };
