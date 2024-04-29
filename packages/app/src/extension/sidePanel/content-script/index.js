/* eslint-disable @typescript-eslint/no-unused-vars */
import { browser } from 'webextension-polyfill-ts';

const APP_ROOT = 'terminus-app-root';
const APP_CONTENT_ROOT = 'webos-content-root';
const createSidebar = async (bridge) => {
	bridge.on('webos.app.url', ({ data, respond }) => {
		respond(chrome.runtime.getURL('www/'));
	});

	initApp();
};

// const checkGoogleSearch = (bridge) => {
// 	const url = new URL(document.location);
// 	return url.host === 'www.google.com' && url.pathname === '/search';
// };

// const checkYoutubeSearch = (bridge) => {
// 	const url = new URL(document.location);
// 	const searchParamsObj = Object.fromEntries(url.searchParams.entries());
// 	return url.host === 'www.youtube.com' && url.pathname === '/watch';
// };

function initApp(webosWrapperId = APP_ROOT) {
	const webosWrapper = document.createElement('div');

	webosWrapper.id = webosWrapperId;

	let target = document.body;
	// if (checkGoogleSearch()) {
	// 	target = document.querySelector('#rhs');
	// 	if (!target) {
	// 		target = document.querySelector('#rcnt');
	// 		Object.assign(webosWrapper.style, {
	// 			marginLeft: '30px'
	// 		});
	// 	}
	// 	target && target.appendChild(webosWrapper);
	// } else if (checkYoutubeSearch()) {
	// 	target = document.querySelector('#secondary');
	// 	target && target.prepend(webosWrapper);
	// } else {
	target.appendChild(webosWrapper);
	// }

	// 添加事件监听器，捕获节点插入事件
	target.addEventListener('DOMNodeInserted', function (event) {
		if (event.target.id === APP_CONTENT_ROOT) {
			fetch(chrome.runtime.getURL('js/cssContent.json'))
				.then((response) => response.json())
				.then((data) => {
					const cssContents = data;

					const shadowHost = document.querySelector(
						`#${webosWrapperId} #${APP_CONTENT_ROOT}`
					);
					const shadowRoot = shadowHost.shadowRoot;
					const stylesData = cssContents.data;
					stylesData.reverse();
					stylesData.forEach((item) => {
						const styleDom = document.createElement('style');
						styleDom.textContent = item.replace(
							/webos_app_plugin_id/g,
							chrome.runtime.id
						);

						shadowRoot.prepend(styleDom);
					});
				})
				.catch((error) => {
					console.error('Error:', error);
				});
		}
	});
}

const createSearch = (bridge) => {
	browser.runtime.onMessage.addListener(async (msg) => {
		if (msg.type === 'toggle-slider') {
			bridge.send('webos.app.status', {
				asideChange: Math.random()
			});
		}
	});
};

export const sidePannelScriptRoot = async (bridge) => {
	await createSidebar(bridge);
	createSearch(bridge);
};
