import { INewDownloadFile } from '../../platform/electron/interface';
import { useFilesStore } from '../../stores/files';

export const downloadElectron = async (data: { url: string }) => {
	const filesStore = useFilesStore();
	const savePath = await window.electron.api.download.getDownloadPath();
	console.log(savePath);

	const formData: INewDownloadFile = {
		url: data.url,
		fileName: filesStore.currentFileList[filesStore.selected[0]].isDir
			? filesStore.currentFileList[filesStore.selected[0]].name + '.zip'
			: filesStore.currentFileList[filesStore.selected[0]].name,
		path: savePath,
		totalBytes: filesStore.currentFileList[filesStore.selected[0]].size
	};
	console.log(formData);

	await window.electron.api.download.newDownloadFile(formData);
};
