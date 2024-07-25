import { INewDownloadFile } from '../../platform/electron/interface';
import { useFilesStore } from '../../stores/files';

export const downloadFile = async (fileUrl: any, filename = '') => {
	const targetUrl = fileUrl.url;
	const headers = fileUrl.headers;

	const xhr = new XMLHttpRequest();
	xhr.open('GET', targetUrl, true);
	xhr.setRequestHeader('Content-Type', 'application/octet-stream');

	Object.keys(headers).forEach((key) => {
		xhr.setRequestHeader(key, headers[key]);
	});

	xhr.responseType = 'blob';

	xhr.onload = () => {
		if (xhr.status === 200) {
			const disposition = xhr.getResponseHeader('content-disposition');
			let name = filename;
			if (!name) {
				const urlParts = targetUrl.split('/');
				const lastPart = urlParts[urlParts.length - 1];
				const fileNameParts = lastPart.split('?');
				name = fileNameParts[0];
				const remainingPart = fileNameParts[fileNameParts.length - 1];
				const argParts = remainingPart.split('&');

				let algoValue = '';
				argParts.forEach((arg) => {
					const keyValue = arg.split('=');
					if (keyValue[0] === 'algo') {
						algoValue = keyValue[1];
					}
				});
				if (name === '') {
					const secondLastPart = urlParts[urlParts.length - 2];
					const secondLastFileNameParts = secondLastPart.split('/');
					name = secondLastFileNameParts[secondLastFileNameParts.length - 1];
				}

				if (algoValue) {
					name += `.${algoValue}`;
				}
			}

			if (disposition) {
				const match = disposition.match(/filename="(.+)"/);
				name = match ? match[1] : name;
			}

			name = decodeURIComponent(name);

			const blob = new Blob([xhr.response], {
				type: 'application/octet-stream'
			});
			const url = URL.createObjectURL(blob);

			const link = document.createElement('a');
			link.href = url;
			link.setAttribute('download', name);
			link.style.display = 'none';

			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			URL.revokeObjectURL(url);
		} else {
			console.error(`Download failed with status ${xhr.status}`);
		}
	};

	xhr.onerror = () => {
		console.error('Download failed');
	};

	xhr.send();
};

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
