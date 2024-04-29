export interface DownloadFilePlugin {
	download(options: {
		url: string;
		name: string;
		id: string;
		force: boolean;
	}): Promise<{
		status: boolean;
		path: string;
		saveStatus: boolean;
	}>;

	isDownloaded(options: { name: string; id: string }): Promise<{
		status: boolean;
		path: string;
	}>;

	updateDownloadSavePathByNewName(options: {
		name: string;
		id: string;
		newName: string;
	}): Promise<{
		status: boolean;
		path: string;
		saveStatus: boolean;
	}>;
}
