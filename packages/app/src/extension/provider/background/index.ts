/* eslint-disable @typescript-eslint/no-unused-vars */
import PortMessage from '../../utils/message/portMessage';
import { busEmit } from 'src/utils/bus';
import {
	Bookmarks,
	browser,
	Menus,
	Runtime,
	Tabs
} from 'webextension-polyfill-ts';
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
import OnRemovedRemoveInfoType = Bookmarks.OnRemovedRemoveInfoType;

export class ProviderBackground
	implements UpdateBadgeInterface, BrowserInterface
{
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
			console.log('========EVENTS.BROADCAST_TO_BACKGROUND========');
			console.log(data);

			const sessionId = port.sender?.tab?.id;
			if (sessionId === undefined || !port.sender?.url) {
				return;
			}
			const origin = getOriginFromUrl(port.sender.url);
			const session = sessionService.getOrCreateSession(sessionId, origin);

			const req = { data, session };
			req.session?.setPortMessage(pm);

			console.log('======== req ========');
			console.log(req);

			const result = provider(req);
			console.log('======== result ========');
			console.log(result);
			return result;
		});
	}

	runtimeOnMessage(_message: any, _sender: Runtime.MessageSender) {
		//Do Nothing
	}

	tabsOnRemoved(_tabId: number, _removeInfo: OnRemovedRemoveInfoType) {
		//Do Nothing
	}
}

export default new ProviderBackground();
