import { Tabs } from 'webextension-polyfill-ts/lib/tabs';
import { Menus, Runtime } from 'webextension-polyfill-ts';
import OnClickData = Menus.OnClickData;
import Port = Runtime.Port;
import MessageSender = Runtime.MessageSender;
import OnRemovedRemoveInfoType = Tabs.OnRemovedRemoveInfoType;
import OnUpdatedChangeInfoType = Tabs.OnUpdatedChangeInfoType;
import OnActivatedActiveInfoType = Tabs.OnActivatedActiveInfoType;
import { ExtensionMessage, ExtensionMessageMode } from './message';

export interface BrowserInterface {
	messageModule: ExtensionMessageMode;

	contextMenusOnClicked(info: OnClickData, tab: Tabs.Tab | undefined);

	runtimeOnConnect(port: Port);

	runtimeOnMessage(message: ExtensionMessage, sender: MessageSender);

	tabsOnRemoved(tabId: number, removeInfo: OnRemovedRemoveInfoType);

	tabsOnUpdated(
		tabId: number,
		updateInfo: OnUpdatedChangeInfoType,
		tab: Tabs.Tab
	);

	tabsOnActivated(activeInfo: OnActivatedActiveInfoType);
}
