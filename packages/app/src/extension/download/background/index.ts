/* eslint-disable @typescript-eslint/no-unused-vars */
import {
	ExtensionBadgeLevel,
	UpdateBadgeInterface
} from '../../interface/updateBadgeInterface';
import { BrowserInterface } from '../../interface/browserInterface';
import { browser, Menus, Runtime, Tabs } from 'webextension-polyfill-ts';
import { CONTEXT_MENUS_SEND_ID } from '../../utils/menusMananger';
import storage from '../../provider/storage/storage';
import {
	ExtensionMessage,
	ExtensionMessageMode
} from '../../interface/message';

export class DownLoadBackground
	implements UpdateBadgeInterface, BrowserInterface
{
	messageModule: ExtensionMessageMode = 'download';

	async init() {
		//Do Nothing
	}

	priority: {
		level: ExtensionBadgeLevel.low;
		num: 40;
	};

	badgeUpdatable(): Promise<boolean> {
		return Promise.resolve(false);
	}

	contextMenusOnClicked(info: Menus.OnClickData, tab: Tabs.Tab | undefined) {
		if (tab == null || tab.id == undefined || info == null) {
			return;
		}

		if (info.menuItemId === CONTEXT_MENUS_SEND_ID) {
			let dataSource = info.linkUrl;
			if (dataSource === '' || dataSource == null) {
				dataSource = tab.url;
			}

			const itemId = this.uuidv4();
			browser.scripting.executeScript({
				target: { tabId: tab.id },
				func: this.showTask,
				args: [itemId, dataSource]
			});

			this.handleRequestSend(dataSource).then((err) => {
				if (tab.id == undefined) {
					return;
				}
				browser.scripting.executeScript({
					target: { tabId: tab.id },
					func: this.showResult,
					args: [itemId, err]
				});
			});
		}
	}

	runtimeOnConnect(_port: Runtime.Port) {
		//Do Nothing
	}

	// runtimeOnMessage(_message:, _sender: Runtime.MessageSender) {
	// 	//Do Nothing
	// }
	runtimeOnMessage(
		_message: ExtensionMessage,
		_sender: Runtime.MessageSender
	) {}

	tabsOnRemoved(_tabId: number, _removeInfo: Tabs.OnRemovedRemoveInfoType) {
		//Do Nothing
	}
	tabsOnUpdated(_tabId: number, _updateInfo: Tabs.OnUpdatedChangeInfoType) {}

	tabsOnActivated(_activeInfo: Tabs.OnActivatedActiveInfoType) {}

	uuidv4 = async () => {
		// return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
		//   (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
		// );
		return crypto.getRandomValues(new Uint8Array(1)).toString();
	};

	updateBadge = async () => {
		const server = await storage.get('server', '');
		// const { server } = await chrome.storage.sync.get(['server', 'token', 'captureCookies']);
		let showText = '';
		if (server) {
			showText = 'GO';
		} else {
			showText = 'FAIL';
		}
		await this._setBadgeDetails({ text: showText }, { color: '#3871E0' });
	};

	_setBadgeDetails = async (textDetails: any, colorDetails: any) => {
		await browser.action.setBadgeText(textDetails);
		await browser.action.setBadgeBackgroundColor(colorDetails);
	};

	handleRequestSend = async (dataSource) => {
		const server = await storage.get('server', '');
		if (!server) {
			return 'Internal error happened in Chrome';
		}

		const data: any = { dataSource: dataSource, path: '' };

		try {
			const response = await fetch(server + '/api/v1/download', {
				method: 'POST',
				mode: 'cors',
				headers: {
					'Content-type': 'application/json'
					// 'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify(data)
			});
			if (response.status === 200) {
				await this._setBadgeDetails({ text: 'OK' }, { color: '#3871E0' });
				return '';
			} else {
				await this._setBadgeDetails({ text: 'FAIL' }, { color: '#3871E0' });
				return response.text();
			}
		} catch (error) {
			await this._setBadgeDetails({ text: 'FAIL' }, { color: '#3871E0' });
			return error.toString();
		}
	};

	showTask = (id, url) => {
		const toastItem = document.createElement('div');
		toastItem.setAttribute('class', 'kubespider-toast');
		toastItem.setAttribute('id', id);

		// TODO: Make this code better
		toastItem.innerHTML =
			'<div class="kubespider-toast-header"> \
                            <svg class="kubespider-toast-color" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" preserveAspectRatio="xMidYMid slice" focusable="false"> \
                                <rect id="statecolor-' +
			id +
			'" width="100%" height="100%" fill="#007aff"></rect> \
                            </svg> \
                            <strong class="kubespider-toast-state" id="state-' +
			id +
			'">Starting...</strong> \
                           </div> \
                           <div class="kubespider-toast-body" id="info-' +
			id +
			'">' +
			url +
			'</div>';

		const parentDOM = document.getElementById('kubespider-parent');
		if (parentDOM) {
			parentDOM.appendChild(toastItem);
		}
	};

	showResult = async (id, err) => {
		// yellow color means success
		let statecolor = '#ffff00';
		if (err != '') {
			// red color means failed
			statecolor = '#ff0100';
		}

		const stateColor = document.getElementById('statecolor-' + id);
		if (stateColor) {
			stateColor.setAttribute('fill', statecolor);
		}

		const state = document.getElementById('state-' + id);
		if (state) {
			if (err != '') {
				state.textContent = 'Fail...';
				const info = document.getElementById('info-' + id);
				if (info) {
					info.textContent = err;
				}
			} else {
				state.textContent = 'Success...';
			}
		}

		// wait 6s to let users see the information
		await new Promise((resolve) => setTimeout(resolve, 6000));

		const task = document.getElementById(id);
		const parentDOM = document.getElementById('kubespider-parent');
		if (parentDOM && task) {
			parentDOM.removeChild(task);
		}
	};
}

export default new DownLoadBackground();
