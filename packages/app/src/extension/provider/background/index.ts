/* eslint-disable @typescript-eslint/no-unused-vars */
import PortMessage from '../../utils/message/portMessage';
import { busEmit } from 'src/utils/bus';
import { browser, Menus, Runtime, Tabs } from 'webextension-polyfill-ts';
import provider from '../provider';
import { getOriginFromUrl } from '../utils';
import {
	notificationService,
	permissionService,
	sessionService
} from '../service';
import {
	UpdateBadgeInterface,
	ExtensionBadgeLevel
} from '../../interface/updateBadgeInterface';
import { getExtensionBackgroundPlatform } from '../../background/extensionBackgroundPlatform';
import { BrowserInterface } from '../../interface/browserInterface';
import OnRemovedRemoveInfoType = Tabs.OnRemovedRemoveInfoType;
import { ExtensionMessageMode } from '../../interface/message';

export class ProviderBackground
	implements UpdateBadgeInterface, BrowserInterface
{
	messageModule: ExtensionMessageMode = 'provider';

	async init() {
		await permissionService.init();
	}

	setUnlock(status: boolean) {
		sessionService.broadcastEvent('setUnlock', status);
	}

	/************ UpdateBadgeInterface *************/

	priority = {
		level: ExtensionBadgeLevel.high,
		num: 50
	};

	badgeUpdatable = async () => {
		const approvalBadge =
			await getExtensionBackgroundPlatform().getApprovalBadgeEnable();
		if (approvalBadge) {
			const approvalCount = notificationService.approvals.length;
			return approvalCount > 0;
		}
		return false;
	};

	updateBadge = async () => {
		const approvalCount = notificationService.approvals.length;
		await browser.action.setBadgeText({ text: approvalCount + '' });
		await browser.action.setBadgeBackgroundColor({ color: '#FE815F' });
	};

	contextMenusOnClicked(_info: Menus.OnClickData, _tab: Tabs.Tab | undefined) {
		//Do Nothing
	}

	runtimeOnConnect(port: Runtime.Port) {
		const pm = new PortMessage(port);
		pm.listen(async (data: any) => {
			if (data.type === 'UI_TO_BACKGROUND') {
				busEmit(data.type, {
					method: data.method,
					params: data.params
				});
				return;
			}
			const sessionId = port.sender?.tab?.id;
			if (sessionId === undefined || !port.sender?.url) {
				return;
			}
			const origin = getOriginFromUrl(port.sender.url);
			const session = sessionService.getOrCreateSession(sessionId, origin);

			const req = { data, session };
			req.session?.setPortMessage(pm);

			const result = provider(req);
			return result;
		});
	}

	runtimeOnMessage(_message: any, _sender: Runtime.MessageSender) {
		//Do Nothing
	}

	tabsOnRemoved(_tabId: number, _removeInfo: OnRemovedRemoveInfoType) {
		//Do Nothing
	}

	tabsOnUpdated(_tabId: number, _updateInfo: Tabs.OnUpdatedChangeInfoType) {}

	tabsOnActivated(_activeInfo: Tabs.OnActivatedActiveInfoType) {}
}

export default new ProviderBackground();
