import { date } from 'quasar';
import { useI18n } from 'vue-i18n';

export enum EllipsisPositon {
	left = 1,
	middile = 2,
	right = 3
}

export const generateStringEllipsis = (
	text: string,
	maxLength = 10,
	ellipsisString = '...',
	position = EllipsisPositon.middile
) => {
	if (!text) {
		return '';
	}
	if (text.length + ellipsisString.length <= maxLength) {
		return text;
	}
	if (ellipsisString.length >= maxLength) {
		return ellipsisString;
	}
	const subEllStringMaxLength = maxLength - ellipsisString.length;

	if (position === EllipsisPositon.left) {
		return text.slice(0, subEllStringMaxLength) + ellipsisString;
	} else if (position === EllipsisPositon.right) {
		return ellipsisString + text.slice(-subEllStringMaxLength);
	}
	return (
		text.slice(0, Math.floor(subEllStringMaxLength / 2)) +
		ellipsisString +
		text.slice(Math.floor(subEllStringMaxLength / 2) * -1)
	);
};

export const hiddenChar = (str: string, frontLen: number, endLen: number) => {
	if (str.length > frontLen + endLen + 3) {
		const ellipsis = '...';
		return (
			str.substring(0, frontLen) + ellipsis + str.substring(str.length - endLen)
		);
	} else {
		return str;
	}
};

export const getPastTime = (stamp1: Date, stamp2: Date) => {
	const { t } = useI18n();

	const time = stamp1.getTime() - stamp2.getTime();
	const second = time / 1000;
	const minute = second / 60;
	if (minute < 1) {
		return t('just_now');
	}
	if (minute < 60) {
		return `${minute.toFixed(0)}` + ' ' + t('minutes_ago');
	}

	const hour = minute / 60;
	if (hour < 24) {
		return `${hour.toFixed(0)}` + ' ' + t('hours_ago');
	}

	const day = hour / 24;
	if (day < 30) {
		return `${day.toFixed(0)} ` + ' ' + t('days_ago');
	}

	const month = day / 30;

	if (month < 12) {
		return `${month.toFixed(0)} months ago` + ' ' + t('months_ago');
	}

	const year = month / 12;
	return `${year.toFixed(0)} years ago` + ' ' + t('years_ago');
};

export const formatStampTime = (
	stamp: number,
	compare = new Date().getTime()
) => {
	const { t } = useI18n();

	const time = compare - stamp;
	const second = time / 1000;
	const minute = second / 60;

	if (minute <= 1) {
		return t('just_now');
	}

	const hour = minute / 60;
	if (hour < 24) {
		return date.formatDate(stamp, 'MM-DD HH:mm');
	}

	const day = hour / 24;

	if (day < 30) {
		return date.formatDate(stamp, 'MM-DD HH:mm');
	}

	return date.formatDate(stamp, 'MMM DD, YYYY');
};

export const UI_TYPE = {
	Tab: 'tab',
	Pop: 'index',
	Notification: 'notification'
};

type UiTypeCheck = {
	isTab: boolean;
	isNotification: boolean;
	isPop: boolean;
};

export const getUiType = (): UiTypeCheck => {
	const location = window.location;
	const pathname = location.pathname;
	return Object.entries(UI_TYPE).reduce((m: any, [key, value]) => {
		m[`is${key}`] = pathname.endsWith(`/${value}.html`);
		return m;
	}, {} as UiTypeCheck);
};

export const getUITypeName = (): string => {
	const UIType = getUiType();
	if (UIType.isPop) return 'popup';
	if (UIType.isNotification) return 'notification';
	if (UIType.isTab) return 'tab';
	return 'popup';
};

export function isIPV4OrIPv6Address(url: string): boolean {
	if (url.toLowerCase() === 'localhost') {
		return true;
	}
	const ipv4Pattern =
		/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

	const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

	return ipv4Pattern.test(url) || ipv6Pattern.test(url);
}
export const stopScrollMove = (m?: (e: any) => void) => {
	document.body.style.overflow = 'hidden';
	if (m) {
		document.addEventListener('touchmove', m, { passive: false });
	}
};

export const startScrollMove = (m?: (e: any) => void) => {
	document.body.style.overflow = '';
	if (m) {
		document.removeEventListener('touchmove', m);
	}
};

export const utcToDate = (utc_datetime: string) => {
	const T_pos = utc_datetime.indexOf('T');
	const Z_pos = utc_datetime.indexOf('Z');
	const year_month_day = utc_datetime.substr(0, T_pos);
	const hour_minute_second = utc_datetime.substr(T_pos + 1, Z_pos - T_pos - 1);
	const new_datetime = year_month_day + ' ' + hour_minute_second;
	return new Date(Date.parse(new_datetime));
};

export const showItemIcon = (name: string) => {
	switch (name) {
		case 'vault':
			return 'sym_r_language';

		case 'web':
			return 'sym_r_language';

		case 'computer':
			return 'sym_r_computer';

		case 'creditCard':
			return 'sym_r_credit_card';

		case 'bank':
			return 'sym_r_account_balance';

		case 'wifi':
			return 'sym_r_wifi_password';

		case 'passport':
			return 'sym_r_assignment_ind';

		case 'authenticator':
			return 'sym_r_password';

		case 'document':
			return 'sym_r_list_alt';

		case 'custom':
			return 'sym_r_chrome_reader_mode';

		default:
			return 'sym_r_language';
	}
};

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

	const audioList = ['mp3', 'wav', 'wmv'];
	result = audioList.find((item) => item === suffix);
	if (result) return 'audio';

	return 'blob';
}

export const utcToStamp = (utc_datetime: string) => {
	const T_pos = utc_datetime.indexOf('T');
	const Z_pos = utc_datetime.indexOf('Z');
	const year_month_day = utc_datetime.substring(0, T_pos);

	const hour_minute_second = utc_datetime.substring(
		T_pos + 1,
		Z_pos - T_pos - 1
	);
	const new_datetime = year_month_day + ' ' + hour_minute_second;

	return new Date(Date.parse(new_datetime));
};

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

export const formatMinutesTime = (minutes: number) => {
	const { t } = useI18n();

	if (minutes < 60) {
		return `${minutes}` + t('time.minutes_short');
	}

	if (minutes < 60 * 24) {
		const hours = Math.floor(minutes / 60);
		const min = minutes % 60;
		return (
			`${hours}` +
			t('time.hour_short') +
			' ' +
			`${min}` +
			t('time.minutes_short')
		);
	}

	const days = Math.floor(minutes / (60 * 24));
	const hours = Math.floor((minutes - days * (60 * 24)) / 60);
	const min = minutes - days * (60 * 24) - hours * 60;

	return (
		`${days}` +
		t('time.days_short') +
		' ' +
		`${hours}` +
		t('time.hour_short') +
		' ' +
		`${min}` +
		t('time.minutes_short')
	);
};
