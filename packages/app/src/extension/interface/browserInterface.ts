import { Tabs } from 'webextension-polyfill-ts/lib/tabs';
import { Bookmarks, Menus, Runtime } from 'webextension-polyfill-ts';
import OnClickData = Menus.OnClickData;
import Port = Runtime.Port;
import MessageSender = Runtime.MessageSender;
import OnRemovedRemoveInfoType = Bookmarks.OnRemovedRemoveInfoType;

export interface BrowserInterface {
	contextMenusOnClicked(info: OnClickData, tab: Tabs.Tab | undefined);

	runtimeOnConnect(port: Port);

	runtimeOnMessage(message: any | undefined, sender: MessageSender);

	tabsOnRemoved(tabId: number, removeInfo: OnRemovedRemoveInfoType);
}
