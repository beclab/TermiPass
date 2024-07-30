import { date } from 'quasar';

export function getFileType(fileName: string) {
	let suffix = '';
	let result: string | undefined = '';
	if (fileName) {
		const flieArr = fileName.split('.');
		suffix = flieArr[flieArr.length - 1];
	}
	if (!suffix) return '';
	suffix = suffix.toLocaleLowerCase();

	const imgList = ['png', 'jpg', 'jpeg', 'bmp', 'gif'];
	result = imgList.find((item) => item === suffix);
	if (result) return 'image';
	// txt
	const txtList = ['txt'];
	result = txtList.find((item) => item === suffix);
	if (result) return 'txt';
	// excel
	const excelList = ['xls', 'xlsx'];
	result = excelList.find((item) => item === suffix);
	if (result) return 'excel';
	// word
	const wordList = ['doc', 'docx'];
	result = wordList.find((item) => item === suffix);
	if (result) return 'word';
	// pdf
	const pdfList = ['pdf'];
	result = pdfList.find((item) => item === suffix);
	if (result) return 'pdf';
	// ppt
	const pptList = ['ppt', 'pptx'];
	result = pptList.find((item) => item === suffix);
	if (result) return 'ppt';
	// zip
	const zipList = ['rar', 'zip', '7z'];
	result = zipList.find((item) => item === suffix);
	if (result) return 'zip';
	// video
	const videoList = [
		'mp4',
		'm2v',
		'mkv',
		'rmvb',
		'wmv',
		'avi',
		'flv',
		'mov',
		'm4v'
	];
	result = videoList.find((item) => item === suffix);
	if (result) return 'video';
	// audio
	const audioList = ['mp3', 'wav', 'wmv'];
	result = audioList.find((item) => item === suffix);
	if (result) return 'audio';
	// other
	return 'blob';
}

export function checkSeahub(url: string) {
	// return url.startsWith('/Seahub/')
	const hasSeahub = url.indexOf('/Seahub/');
	if (hasSeahub > -1) {
		return true;
	} else {
		return false;
	}
}

export function isAppData(url: string) {
	const res = url == '/AppData/' || url == '/AppData';
	return res;
}

export function checkAppData(url: string) {
	return (
		url.startsWith('/AppData/') ||
		(url.startsWith('/cache/') && !isAppData(url))
	);
}

export function getAppDataPath(url: string) {
	const res = url.split('/');
	if (res[1] != 'AppData' && res[1] != 'Cache') {
		throw Error('Invalid AppData path');
	}
	const node = res[2];
	let path = '';
	for (let i = 3; i < res.length; i++) {
		path = path + '/';
		path = path + res[i];
	}

	return { node, path };
}

export const formatFileModified = (
	modified: number | string | Date,
	format = 'YYYY-MM-DD HH:mm:ss'
) => {
	return date.formatDate(modified, format);
};

export function checkSameName(fileName: string, items: any, index = 0) {
	const hasSameName = items.findIndex((item: any) => {
		return item.name === fileName;
	});

	if (hasSameName > -1) {
		let prefix = fileName;
		if (index > 0) {
			prefix = fileName.slice(0, fileName.indexOf(`(${index})`));
		}

		const filename = `${prefix}(${index + 1})`;

		return checkSameName(filename, items, index + 1);
	} else {
		return fileName;
	}
}

export function disabledClick(path: string) {
	const disabledRightClick = ['/Data/', '/Cache/'];
	let prefix = path;
	if (!prefix.endsWith('/')) {
		prefix = prefix + '/';
	}

	if (disabledRightClick.includes(prefix)) {
		return false;
	}

	return true;
}

export function hideHeaderOpt(path: string) {
	const disabledRightClick = ['/Data/', '/Cache/'];

	let prefix = path;
	if (!prefix.endsWith('/')) {
		prefix = prefix + '/';
	}

	if (disabledRightClick.includes(prefix)) {
		return false;
	}

	return true;
}
