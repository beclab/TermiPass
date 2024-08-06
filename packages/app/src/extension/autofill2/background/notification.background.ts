/* eslint-disable @typescript-eslint/no-unused-vars */
import { Runtime, Tabs, browser } from 'webextension-polyfill-ts';
import {
	AddLoginQueueMessage,
	AddRequestFilelessImportQueueMessage,
	AddUnlockVaultQueueMessage,
	LockedVaultPendingNotificationsData,
	NotificationBackgroundExtensionMessage,
	NotificationBackgroundExtensionMessageHandlers,
	NotificationQueueMessageItem
} from './abstractions/notification.background';
import {
	AddLoginMessageData,
	NOTIFICATION_BAR_LIFESPAN_MS,
	NotificationQueueMessageType
} from '../utils/notification';
import {
	AutofillService,
	NeverDomains
} from '../services/abstractions/autofill.service';
import {
	getTabFromCurrentWindow,
	getTabFromCurrentWindowId
} from 'src/extension/browser';
import { getExtensionBackgroundPlatform } from 'src/extension/background/extensionBackgroundPlatform';
import { AuthService } from 'src/extension/services/abstractions/auth.service';
import { AuthenticationStatus } from 'src/extension/utils/enums';
import { FieldType } from '@didvault/sdk/src/core';
import { Utils } from 'src/extension/utils';
import { OverlayBackgroundExtensionMessage } from './abstractions/overlay.background';
import provider from 'src/extension/provider/provider';
import { getOriginFromUrl } from 'src/extension/provider/utils';
import { sessionService } from 'src/extension/provider/service';

export default class NotificationBackground {
	private notificationQueue: NotificationQueueMessageItem[] = [];
	private readonly extensionMessageHandlers: NotificationBackgroundExtensionMessageHandlers =
		{
			unlockCompleted: ({ message, sender }) =>
				this.handleUnlockCompleted(message, sender),
			bgGetFolderData: () => this.getFolderData(),
			bgCloseNotificationBar: ({ sender }) =>
				this.handleCloseNotificationBarMessage(sender),
			bgAdjustNotificationBar: ({ message, sender }) =>
				this.handleAdjustNotificationBarMessage(message, sender),
			bgAddLogin: ({ message, sender }) => this.addLogin(message, sender),
			bgRemoveTabFromNotificationQueue: ({ sender }) =>
				this.removeTabFromNotificationQueue(sender.tab),
			bgSaveCipher: ({ message, sender }) =>
				this.handleSaveCipherMessage(message, sender),
			bgNeverSave: ({ sender }) => this.saveNever(sender.tab),
			collectPageDetailsResponse: ({ message }) =>
				this.handleCollectPageDetailsResponseMessage(message),
			bgUnlockPopoutOpened: ({ message, sender }) =>
				this.unlockVault(message, sender.tab),
			checkNotificationQueue: ({ sender }) =>
				this.checkNotificationQueue(sender.tab),
			// bgReopenUnlockPopout: ({ sender }) => this.openUnlockPopout(sender.tab),
			bgGetEnableChangedPasswordPrompt: () =>
				this.getEnableChangedPasswordPrompt(),
			bgGetEnableAddedLoginPrompt: () => this.getEnableAddedLoginPrompt(),
			bgGetExcludedDomains: () => this.getExcludedDomains(),
			// bgGetActiveUserServerConfig: () => this.getActiveUserServerConfig(),
			getWebVaultUrlForNotification: () => this.getWebVaultUrl()
		};

	constructor(
		private autofillService: AutofillService,
		private authService: AuthService
	) {}

	async init() {
		if (chrome.runtime == null) {
			return;
		}

		this.setupExtensionMessageListener();

		this.cleanupNotificationQueue();
	}

	async getEnableChangedPasswordPrompt(): Promise<boolean> {
		// return await firstValueFrom(
		// 	this.userNotificationSettingsService.enableChangedPasswordPrompt$
		// );
		return false;
	}
	async getEnableAddedLoginPrompt(): Promise<boolean> {
		// return await firstValueFrom(
		// 	this.userNotificationSettingsService.enableAddedLoginPrompt$
		// );
		return true;
	}

	async getExcludedDomains(): Promise<NeverDomains> {
		// return await firstValueFrom(this.domainSettingsService.neverDomains$);
		return {};
	}

	async checkNotificationQueue(tab?: Tabs.Tab): Promise<void> {
		if (this.notificationQueue.length === 0) {
			return;
		}

		if (tab != null) {
			await this.doNotificationQueueCheck(tab);
			return;
		}

		const currentTab = await getTabFromCurrentWindow();
		if (currentTab != null) {
			await this.doNotificationQueueCheck(currentTab);
		}
	}

	private cleanupNotificationQueue() {
		for (let i = this.notificationQueue.length - 1; i >= 0; i--) {
			if (this.notificationQueue[i].expires < new Date()) {
				if (this.notificationQueue[i].tab && this.notificationQueue[i].tab.id) {
					browser.tabs.sendMessage(this.notificationQueue[i].tab.id!, {
						command: 'closeNotificationBar'
					});
					this.notificationQueue.splice(i, 1);
				}
			}
		}
		setTimeout(() => this.cleanupNotificationQueue(), 30000); // check every 30 seconds
	}

	private async doNotificationQueueCheck(tab?: Tabs.Tab): Promise<void> {
		const tabDomain = Utils.getDomain(tab?.url);
		if (!tabDomain) {
			return;
		}

		const queueMessage = this.notificationQueue.find(
			(message) => message.tab.id === tab?.id && message.domain === tabDomain
		);
		if (queueMessage && tab) {
			await this.sendNotificationQueueMessage(tab, queueMessage);
		}
	}

	private async sendNotificationQueueMessage(
		tab: Tabs.Tab,
		notificationQueueMessage: NotificationQueueMessageItem
	) {
		const notificationType = notificationQueueMessage.type;

		const typeData: Record<string, any> = {
			isVaultLocked: notificationQueueMessage.wasVaultLocked,
			theme: 'light'
		};

		switch (notificationType) {
			case NotificationQueueMessageType.AddLogin:
				typeData.removeIndividualVault = await this.removeIndividualVault();
				break;
			case NotificationQueueMessageType.RequestFilelessImport:
				typeData.importType = (
					notificationQueueMessage as AddRequestFilelessImportQueueMessage
				).importType;
				break;
		}

		if (!tab.id) {
			return;
		}
		browser.tabs.sendMessage(tab.id, {
			command: 'openNotificationBar',
			data: {
				type: notificationType,
				typeData
			}
		});
	}

	private removeTabFromNotificationQueue(tab?: Tabs.Tab) {
		for (let i = this.notificationQueue.length - 1; i >= 0; i--) {
			if (this.notificationQueue[i].tab.id === tab?.id) {
				this.notificationQueue.splice(i, 1);
			}
		}
	}

	private async addLogin(
		message: NotificationBackgroundExtensionMessage,
		sender: Runtime.MessageSender
	) {
		const authStatus = await this.authService.getAuthStatus();
		if (authStatus === AuthenticationStatus.LoggedOut) {
			return;
		}

		const loginInfo = message.login;
		const normalizedUsername = loginInfo?.username
			? loginInfo.username.toLowerCase()
			: '';
		const loginDomain = Utils.getDomain(loginInfo?.url);
		if (loginDomain == null) {
			return;
		}

		const addLoginIsEnabled = await this.getEnableAddedLoginPrompt();

		if (authStatus === AuthenticationStatus.Locked) {
			if (addLoginIsEnabled) {
				await this.pushAddLoginToQueue(
					loginDomain,
					loginInfo,
					sender.tab,
					true
				);
			}

			return;
		}

		const vaults = await this.getItemsForTab();
		const usernameMatches = vaults.filter(
			(c) =>
				c.fields.find((e) => e.type == FieldType.Username)?.value ==
				normalizedUsername
		);
		if (addLoginIsEnabled && usernameMatches.length === 0) {
			await this.pushAddLoginToQueue(loginDomain, loginInfo, sender.tab);
		}
	}

	private async pushAddLoginToQueue(
		loginDomain: string,
		loginInfo?: AddLoginMessageData,
		tab?: Tabs.Tab,
		isVaultLocked = false
	) {
		if (!tab || !loginInfo) {
			return;
		}
		this.removeTabFromNotificationQueue(tab);
		const message: AddLoginQueueMessage = {
			type: NotificationQueueMessageType.AddLogin,
			username: loginInfo?.username,
			password: loginInfo?.password,
			domain: loginDomain,
			uri: loginInfo.url,
			tab: tab,
			expires: new Date(new Date().getTime() + NOTIFICATION_BAR_LIFESPAN_MS),
			wasVaultLocked: isVaultLocked
		};
		this.notificationQueue.push(message);
		await this.checkNotificationQueue(tab);
	}

	private async handleCollectPageDetailsResponseMessage(
		message: NotificationBackgroundExtensionMessage
	) {
		if (message.sender !== 'notificationBar') {
			return;
		}

		if (!message.details || !message.tab || !message.tab.id) {
			return;
		}
		const forms = this.autofillService.getFormsWithPasswordFields(
			message.details
		);
		browser.tabs.sendMessage(message.tab.id, {
			command: 'notificationBarPageDetails',
			data: {
				details: message.details,
				forms: forms
			}
		});
	}

	private async unlockVault(
		message: NotificationBackgroundExtensionMessage,
		tab?: Tabs.Tab
	) {
		if (message.data?.skipNotification) {
			return;
		}

		const currentAuthStatus = await this.authService.getAuthStatus();
		if (
			currentAuthStatus !== AuthenticationStatus.Locked ||
			this.notificationQueue.length
		) {
			return;
		}

		const loginDomain = Utils.getDomain(tab?.url);
		if (loginDomain) {
			await this.pushUnlockVaultToQueue(loginDomain, tab);
		}
	}
	async requestFilelessImport(tab: Tabs.Tab, importType: string) {
		const currentAuthStatus = await this.authService.getAuthStatus();
		if (
			currentAuthStatus !== AuthenticationStatus.Unlocked ||
			this.notificationQueue.length
		) {
			return;
		}

		const loginDomain = Utils.getDomain(tab.url);
		if (loginDomain) {
			await this.pushRequestFilelessImportToQueue(loginDomain, tab, importType);
		}
	}

	private async pushUnlockVaultToQueue(loginDomain: string, tab?: Tabs.Tab) {
		if (!tab) {
			return;
		}
		this.removeTabFromNotificationQueue(tab);
		const message: AddUnlockVaultQueueMessage = {
			type: NotificationQueueMessageType.UnlockVault,
			domain: loginDomain,
			tab: tab,
			expires: new Date(new Date().getTime() + 0.5 * 60000), // 30 seconds
			wasVaultLocked: true
		};
		await this.sendNotificationQueueMessage(tab, message);
	}
	private async pushRequestFilelessImportToQueue(
		loginDomain: string,
		tab: Tabs.Tab,
		importType?: string
	) {
		this.removeTabFromNotificationQueue(tab);
		const message: AddRequestFilelessImportQueueMessage = {
			type: NotificationQueueMessageType.RequestFilelessImport,
			domain: loginDomain,
			tab,
			expires: new Date(new Date().getTime() + 0.5 * 60000), // 30 seconds
			wasVaultLocked: false,
			importType
		};
		this.notificationQueue.push(message);
		await this.checkNotificationQueue(tab);
		this.removeTabFromNotificationQueue(tab);
	}
	private async handleSaveCipherMessage(
		message: NotificationBackgroundExtensionMessage,
		sender: Runtime.MessageSender
	) {
		if (!sender.tab) {
			return;
		}
		if (
			(await this.authService.getAuthStatus()) < AuthenticationStatus.Unlocked
		) {
			const sessionId = sender.tab.id;
			if (sessionId === undefined || !sender?.url) {
				return;
			}
			const origin = getOriginFromUrl(sender!.url!);
			const session = sessionService.getOrCreateSession(sessionId, origin);

			await provider({
				data: {
					method: 'getUserInfo',
					from: 'bg'
				},
				session
			});
			// return;
		}
		await this.saveOrUpdateCredentials(
			sender.tab,
			message.edit || false,
			message.folder
		);
	}
	private async saveOrUpdateCredentials(
		tab: Tabs.Tab,
		_edit: boolean,
		_folderId?: string
	) {
		if (!tab.id) {
			return;
		}

		for (let i = this.notificationQueue.length - 1; i >= 0; i--) {
			const queueMessage = this.notificationQueue[i];
			if (
				queueMessage.tab.id !== tab.id ||
				queueMessage.type !== NotificationQueueMessageType.AddLogin
			) {
				continue;
			}
			const tabDomain = Utils.getDomain(tab.url);
			if (tabDomain != null && tabDomain !== queueMessage.domain) {
				continue;
			}
			this.notificationQueue.splice(i, 1);
			try {
				console.log('frontAddNewVaultItem ===>');
				console.log(queueMessage.uri);
				console.log(queueMessage.password);
				console.log(queueMessage.username);

				const sessionId = tab.id;
				if (sessionId === undefined || !tab.url) {
					return;
				}
				const origin = getOriginFromUrl(tab!.url!);
				const session = sessionService.getOrCreateSession(sessionId, origin);
				const center = getExtensionBackgroundPlatform().dataCenter;
				await provider({
					data: {
						method: 'addVault',
						from: 'bg',
						params: {
							url: queueMessage.uri,
							username: queueMessage.username,
							didKey: await center.getCurrentDidKey(),
							password: queueMessage.password
						}
					},
					session
				});

				await browser.tabs.sendMessage(tab.id, {
					command: 'saveCipherAttemptCompleted'
				});
			} catch (error) {
				console.log(error);

				await browser.tabs.sendMessage(tab.id, {
					command: 'saveCipherAttemptCompleted',
					error: error
				});
			}
		}
	}
	private async saveNever(tab?: Tabs.Tab) {
		for (let i = this.notificationQueue.length - 1; i >= 0; i--) {
			const queueMessage = this.notificationQueue[i];
			if (
				queueMessage.tab.id !== tab?.id ||
				queueMessage.type !== NotificationQueueMessageType.AddLogin
			) {
				continue;
			}

			const tabDomain = Utils.getDomain(tab?.url);
			if (tabDomain != null && tabDomain !== queueMessage.domain) {
				continue;
			}

			this.notificationQueue.splice(i, 1);
			// await BrowserApi.tabSendMessageData(tab, 'closeNotificationBar');
			if (tab && tab.id) {
				browser.tabs.sendMessage(tab.id, {
					command: 'closeNotificationBar'
				});
			}
		}
	}

	private async getFolderData() {
		return [];
	}

	private async getWebVaultUrl(): Promise<string> {
		return '';
	}

	private async removeIndividualVault(): Promise<boolean> {
		return false;
	}

	private async handleUnlockCompleted(
		message: NotificationBackgroundExtensionMessage,
		_sender: Runtime.MessageSender
	): Promise<void> {
		const messageData = message.data as LockedVaultPendingNotificationsData;
		const retryCommand = messageData.commandToRetry.message.command;
		if (retryCommand === 'autofill_login') {
			// await BrowserApi.tabSendMessageData(sender.tab, 'closeNotificationBar');
		}

		if (messageData.target !== 'notification.background') {
			return;
		}

		const retryHandler: CallableFunction | undefined =
			this.extensionMessageHandlers[retryCommand];
		if (retryHandler) {
			retryHandler({
				message: messageData.commandToRetry.message,
				sender: messageData.commandToRetry.sender
			});
		}
	}

	private async handleCloseNotificationBarMessage(
		sender: Runtime.MessageSender
	) {
		if (!sender.tab || !sender.tab.id) {
			return;
		}
		browser.tabs.sendMessage(sender.tab.id, {
			command: 'closeNotificationBar'
		});
	}

	private async handleAdjustNotificationBarMessage(
		message: NotificationBackgroundExtensionMessage,
		sender: Runtime.MessageSender
	) {
		if (!sender.tab || !sender.tab.id) {
			return;
		}
		browser.tabs.sendMessage(sender.tab.id, {
			command: 'adjustNotificationBar',
			data: message.data
		});
	}

	private setupExtensionMessageListener() {
		chrome.runtime.onMessage.addListener(this.handleExtensionMessage);
	}

	private handleExtensionMessage = (
		message: OverlayBackgroundExtensionMessage,
		sender: chrome.runtime.MessageSender,
		sendResponse: (response?: any) => void
	) => {
		const handler: CallableFunction | undefined =
			this.extensionMessageHandlers[message?.type];
		if (!handler) {
			return;
		}

		const messageResponse = handler({ message, sender });
		if (!messageResponse) {
			return;
		}

		Promise.resolve(messageResponse).then((response) => sendResponse(response));
		return true;
	};

	private async getItemsForTab() {
		const tab = await getTabFromCurrentWindowId();
		try {
			if (!tab || !tab.url) {
				return [];
			}
			const url = new URL(tab.url as string);
			return getExtensionBackgroundPlatform().dataCenter.getWebVaultItems(
				url.host
			);
		} catch (e) {
			return [];
		}
	}
}
