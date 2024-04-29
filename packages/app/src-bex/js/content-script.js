// Content script content goes here or in activatedContentHooks (use activatedContentHooks if you need a variable
// accessible to both the content script and inside a hook
const pluginId = chrome.runtime.id;

window.webos_app_plugin_id = pluginId;

modifyAppCss(pluginId);
const extenstionAppUrl = ``;

function modifyAppCss(pluginId) {
	fetch(chrome.runtime.getURL('www/css/app.css'))
		.then((response) => response.text())
		.then((cssText) => {
			let cssTextNew = cssText.replace(
				/url\(..\/fonts\//g,
				`url(chrome-extension://${pluginId}/www/fonts/`
			);

			const regex = /@font-face \{([\s\S]*?)\}/g;
			const matches = cssTextNew.match(regex);
			cssTextNew = matches.join('');

			const style = document.createElement('style');
			style.textContent = cssTextNew;

			document.head.appendChild(style);
		})
		.catch((error) => console.error('Error fetching CSS file:', error));
}
