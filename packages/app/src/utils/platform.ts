import { Platform } from 'quasar';
export const isPad = () => {
	return Platform.is.ipad || isAndroidTablet();
};

const isAndroidTablet = () => {
	return (
		/android/i.test(navigator.userAgent) && !/mobile/i.test(navigator.userAgent)
	);
};
