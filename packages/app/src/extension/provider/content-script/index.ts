import { browser } from 'webextension-polyfill-ts';
import PortMessage from '../../utils/message/portMessage';
import WindowMessage from '../../utils/message/windowMessage';
/**
 * 每个网站注册执行程序
 */
export const initContentScript = async () => {
	const initListener = () => {
		const pm = new PortMessage().connect();

		const bcm = new WindowMessage().listen((data: any) => pm.request(data));

		pm.on('message', (data) => bcm.send('message', data));
		pm.request({
			type: 'UI_TO_BACKGROUND',
			method: 'getScreen',
			params: { availHeight: screen.availHeight }
		});

		document.addEventListener('beforeunload', () => {
			bcm.dispose();
			pm.dispose();
		});
	};

	const container = document.head || document.documentElement;
	const ele = document.createElement('script');
	ele.setAttribute(
		'src',
		browser.runtime.getURL('www/js/TermiPassProvider.js')
	);
	container.insertBefore(ele, container.children[0]);
	container.removeChild(ele);
	initListener();
};
