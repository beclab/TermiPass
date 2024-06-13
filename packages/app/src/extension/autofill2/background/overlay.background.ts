/* eslint-disable @typescript-eslint/no-unused-vars */
import { FieldType, VaultItem } from '@didvault/sdk/src/core';
import {
	AutofillService,
	PageDetail
} from '../services/abstractions/autofill.service';
import {
	FocusedFieldData,
	OverlayAddNewItemMessage,
	OverlayBackgroundExtensionMessage,
	OverlayBackgroundExtensionMessageHandlers,
	OverlayBackground as OverlayBackgroundInterface,
	OverlayButtonPortMessageHandlers,
	OverlayCipherData,
	OverlayListPortMessageHandlers,
	OverlayPortMessage
} from './abstractions/overlay.background';
import { getTabFromCurrentWindowId } from '../../browser';
import { getExtensionBackgroundPlatform } from 'src/extension/background/extensionBackgroundPlatform';
import { browser, Runtime } from 'webextension-polyfill-ts';
import { CipherRepromptType } from '../utils';
import {
	AutofillOverlayElement,
	AutofillOverlayPort,
	AutofillOverlayVisibility,
	InlineMenuVisibilitySetting
} from '../utils/autofill-overlay.enum';
import { AuthenticationStatus } from 'src/extension/utils/enums';
import { AuthService } from 'src/extension/services/auth.service';

class OverlayBackground implements OverlayBackgroundInterface {
	private overlayLoginVault: Map<string, VaultItem> = new Map();
	private pageDetailsForTab: Record<
		number,
		Map<chrome.runtime.MessageSender['frameId'], PageDetail>
	> = {};
	// private userAuthStatus: AuthenticationStatus = AuthenticationStatus.LoggedOut;
	private overlayButtonPort?: Runtime.Port;
	private overlayListPort?: Runtime.Port;
	private expiredPorts: Runtime.Port[] = [];
	private focusedFieldData: FocusedFieldData;
	private overlayPageTranslations: Record<string, string>;
	// private iconsServerUrl: string;
	private userAuthStatus: AuthenticationStatus = AuthenticationStatus.LoggedOut;
	private readonly extensionMessageHandlers: OverlayBackgroundExtensionMessageHandlers =
		{
			openAutofillOverlay: () => this.openOverlay(false),
			autofillOverlayElementClosed: ({ message, sender }) =>
				this.overlayElementClosed(message, sender),
			autofillOverlayAddNewVaultItem: ({ message, sender }) =>
				this.addNewVaultItem(message, sender),
			getAutofillOverlayVisibility: () => this.getOverlayVisibility(),
			checkAutofillOverlayFocused: () => this.checkOverlayFocused(),
			focusAutofillOverlayList: () => this.focusOverlayList(),
			updateAutofillOverlayPosition: ({ message, sender }) =>
				this.updateOverlayPosition(message, sender),
			updateAutofillOverlayHidden: ({ message }) =>
				this.updateOverlayHidden(message),
			updateFocusedFieldData: ({ message, sender }) =>
				this.setFocusedFieldData(message, sender),
			collectPageDetailsResponse: ({ message, sender }) =>
				this.storePageDetails(message, sender),
			unlockCompleted: ({ message }) => this.unlockCompleted(message),
			updateVaultComplete: () => this.updateOverlayCiphers()
		};
	private readonly overlayButtonPortMessageHandlers: OverlayButtonPortMessageHandlers =
		{
			overlayButtonClicked: ({ port }) => this.handleOverlayButtonClicked(port),
			closeAutofillOverlay: ({ port }) => this.closeOverlay(port),
			forceCloseAutofillOverlay: ({ port }) => this.closeOverlay(port, true),
			overlayPageBlurred: () => this.checkOverlayListFocused(),
			redirectOverlayFocusOut: ({ message, port }) =>
				this.redirectOverlayFocusOut(message, port)
		};
	private readonly overlayListPortMessageHandlers: OverlayListPortMessageHandlers =
		{
			checkAutofillOverlayButtonFocused: () => this.checkOverlayButtonFocused(),
			forceCloseAutofillOverlay: ({ port }) => this.closeOverlay(port, true),
			overlayPageBlurred: () => this.checkOverlayButtonFocused(),
			unlockVault: ({ port }) => this.unlockVault(port),
			fillSelectedListItem: ({ message, port }) =>
				this.fillSelectedOverlayListItem(message, port),
			addNewVaultItem: ({ port }) => this.getNewVaultItemDetails(port),
			viewSelectedCipher: ({ message, port }) =>
				this.viewSelectedCipher(message, port),
			redirectOverlayFocusOut: ({ message, port }) =>
				this.redirectOverlayFocusOut(message, port)
		};

	constructor(
		private autofillService: AutofillService,
		private authService: AuthService
	) {} // private themeStateService: ThemeStateService // private platformUtilsService: PlatformUtilsService, // private i18nService: I18nService, // private autofillSettingsService: AutofillSettingsServiceAbstraction, // private domainSettingsService: DomainSettingsService, // private environmentService: EnvironmentService, // private authService: AuthService, // private autofillService: AutofillService,

	/**
	 * Removes cached page details for a tab
	 * based on the passed tabId.
	 *
	 * @param tabId - Used to reference the page details of a specific tab
	 */
	removePageDetails(tabId: number) {
		if (!this.pageDetailsForTab[tabId]) {
			return;
		}

		this.pageDetailsForTab[tabId].clear();
		delete this.pageDetailsForTab[tabId];
	}

	/**
	 * Sets up the extension message listeners and gets the settings for the
	 * overlay's visibility and the user's authentication status.
	 */
	async init() {
		this.setupExtensionMessageListeners();
		// const env = await firstValueFrom(this.environmentService.environment$);
		// this.iconsServerUrl = env.getIconsUrl();
		await this.getOverlayVisibility();
		await this.getAuthStatus();
	}

	/**
	 * Updates the overlay list's ciphers and sends the updated list to the overlay list iframe.
	 * Queries all ciphers for the given url, and sorts them by last used. Will not update the
	 * list of ciphers if the extension is not unlocked.
	 */
	async updateOverlayCiphers() {
		// const authStatus = await firstValueFrom(
		// 	this.authService.activeAccountStatus$
		// );

		const authStatus = await this.getAuthStatus();
		if (authStatus !== AuthenticationStatus.Unlocked) {
			return;
		}

		const currentTab = await getTabFromCurrentWindowId();
		if (!currentTab?.url || !currentTab.id) {
			return;
		}
		this.overlayLoginVault = new Map();
		const vaultItems = await this.getItemsForTab();
		for (let vaultIndex = 0; vaultIndex < vaultItems.length; vaultIndex++) {
			this.overlayLoginVault.set(
				`overlay-cipher-${vaultIndex}`,
				vaultItems[vaultIndex]
			);
		}
		const ciphers = await this.getOverlayCipherData();
		this.overlayListPort?.postMessage({
			command: 'updateOverlayListCiphers',
			ciphers
		});
		await browser.tabs.sendMessage(currentTab.id, {
			command: 'updateIsOverlayCiphersPopulated',
			isOverlayCiphersPopulated: Boolean(ciphers.length)
		});
	}

	/**
	 * Strips out unnecessary data from the ciphers and returns an array of
	 * objects that contain the cipher data needed for the overlay list.
	 */
	private async getOverlayCipherData(): Promise<OverlayCipherData[]> {
		// const showFavicons = await firstValueFrom(
		// 	this.domainSettingsService.showFavicons$
		// );
		const overlayVaultsArray = Array.from(this.overlayLoginVault);
		const overlayCipherData: OverlayCipherData[] = [];
		// let loginCipherIcon: WebsiteIconData | undefined;

		for (
			let vaultIndex = 0;
			vaultIndex < overlayVaultsArray.length;
			vaultIndex++
		) {
			const [overlayVaultId, vaultItem] = overlayVaultsArray[vaultIndex];
			// if (!loginCipherIcon && vaultItem.type === VaultType.Default) {
			// 	loginCipherIcon = buildCipherIcon(
			// 		this.iconsServerUrl,
			// 		cipher,
			// 		showFavicons
			// 	);
			// }

			overlayCipherData.push({
				id: overlayVaultId,
				name: vaultItem.name,
				type: vaultItem.type as any,
				reprompt: CipherRepromptType.Password,
				favorite: false,
				icon: {
					imageEnabled: false,
					image: '',
					fallbackImage: '',
					icon: ''
				},
				login: {
					username:
						vaultItem.fields.find((e) => e.type == FieldType.Username)?.value ||
						''
				},
				card: undefined
			});
		}

		return overlayCipherData;
	}

	/**
	 * Handles aggregation of page details for a tab. Stores the page details
	 * in association with the tabId of the tab that sent the message.
	 *
	 * @param message - Message received from the `collectPageDetailsResponse` command
	 * @param sender - The sender of the message
	 */
	private storePageDetails(
		message: OverlayBackgroundExtensionMessage,
		sender: Runtime.MessageSender
	) {
		const pageDetails = {
			frameId: sender.frameId,
			tab: sender.tab,
			details: message.details
		};
		if (!sender.tab?.id) {
			return;
		}
		// if (sender.frameId) {
		// 	return;
		// }
		const pageDetailsMap = this.pageDetailsForTab[sender.tab.id];
		if (!pageDetailsMap) {
			this.pageDetailsForTab[sender.tab.id] = new Map([
				[sender.frameId, pageDetails]
			]) as any;
			return;
		}

		pageDetailsMap.set(sender.frameId, pageDetails as any);
	}

	/**
	 * Triggers autofill for the selected cipher in the overlay list. Also places
	 * the selected cipher at the top of the list of ciphers.
	 *
	 * @param overlayCipherId - Cipher ID corresponding to the overlayLoginCiphers map. Does not correspond to the actual cipher's ID.
	 * @param sender - The sender of the port message
	 */
	private async fillSelectedOverlayListItem(
		{ overlayCipherId }: OverlayPortMessage,
		{ sender }: Runtime.Port
	) {
		if (!sender?.tab?.id) {
			return;
		}
		const pageDetails = this.pageDetailsForTab[sender.tab.id];
		if (!overlayCipherId || !pageDetails?.size) {
			return;
		}

		const vault = this.overlayLoginVault.get(overlayCipherId);
		if (!vault) {
			return;
		}
		await this.autofillService.doAutoFill({
			tab: sender.tab,
			item: vault,
			pageDetails: Array.from(pageDetails.values()),
			fillNewPassword: true,
			allowTotpAutofill: true
		});

		this.overlayLoginVault = new Map([
			[overlayCipherId, vault],
			...this.overlayLoginVault
		]);
	}

	/**
	 * Checks if the overlay is focused. Will check the overlay list
	 * if it is open, otherwise it will check the overlay button.
	 */
	private checkOverlayFocused() {
		if (this.overlayListPort) {
			this.checkOverlayListFocused();

			return;
		}

		this.checkOverlayButtonFocused();
	}

	/**
	 * Posts a message to the overlay button iframe to check if it is focused.
	 */
	private checkOverlayButtonFocused() {
		this.overlayButtonPort?.postMessage({
			command: 'checkAutofillOverlayButtonFocused'
		});
	}

	/**
	 * Posts a message to the overlay list iframe to check if it is focused.
	 */
	private checkOverlayListFocused() {
		this.overlayListPort?.postMessage({
			command: 'checkAutofillOverlayListFocused'
		});
	}

	/**
	 * Sends a message to the sender tab to close the autofill overlay.
	 *
	 * @param sender - The sender of the port message
	 * @param forceCloseOverlay - Identifies whether the overlay should be force closed
	 */
	private closeOverlay({ sender }: Runtime.Port, forceCloseOverlay = false) {
		// FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
		// eslint-disable-next-line @typescript-eslint/no-floating-promises
		// BrowserApi.tabSendMessageData(sender.tab, 'closeAutofillOverlay', {
		// 	forceCloseOverlay
		// });
		if (!sender?.tab?.id) {
			return;
		}
		browser.tabs.sendMessage(sender.tab.id, {
			command: 'closeAutofillOverlay',
			forceCloseOverlay
		});
	}

	/**
	 * Handles cleanup when an overlay element is closed. Disconnects
	 * the list and button ports and sets them to null.
	 *
	 * @param overlayElement - The overlay element that was closed, either the list or button
	 * @param sender - The sender of the port message
	 */
	private overlayElementClosed(
		{ overlayElement }: OverlayBackgroundExtensionMessage,
		sender: Runtime.MessageSender
	) {
		if (sender.tab?.id !== this.focusedFieldData?.tabId) {
			this.expiredPorts.forEach((port) => port.disconnect());
			this.expiredPorts = [];
			return;
		}

		if (overlayElement === AutofillOverlayElement.Button) {
			this.overlayButtonPort?.disconnect();
			this.overlayButtonPort = undefined;

			return;
		}

		this.overlayListPort?.disconnect();
		this.overlayListPort = undefined;
	}

	/**
	 * Updates the position of either the overlay list or button. The position
	 * is based on the focused field's position and dimensions.
	 *
	 * @param overlayElement - The overlay element to update, either the list or button
	 * @param sender - The sender of the port message
	 */
	private updateOverlayPosition(
		{ overlayElement }: { overlayElement?: string },
		sender?: Runtime.MessageSender
	) {
		if (!overlayElement || sender?.tab?.id !== this.focusedFieldData?.tabId) {
			return;
		}

		if (overlayElement === AutofillOverlayElement.Button) {
			this.overlayButtonPort?.postMessage({
				command: 'updateIframePosition',
				styles: this.getOverlayButtonPosition()
			});

			return;
		}
		this.overlayListPort?.postMessage({
			command: 'updateIframePosition',
			styles: this.getOverlayListPosition()
		});
	}

	/**
	 * Gets the position of the focused field and calculates the position
	 * of the overlay button based on the focused field's position and dimensions.
	 */
	private getOverlayButtonPosition() {
		if (!this.focusedFieldData) {
			return;
		}

		const { top, left, width, height } =
			this.focusedFieldData.focusedFieldRects;

		const formatHeight = height || 0;
		const formatTop = top || 0;
		const formatLeft = left || 0;
		const formatWidth = width || 0;

		const { paddingRight, paddingLeft } =
			this.focusedFieldData.focusedFieldStyles;
		let elementOffset = formatHeight * 0.37;
		if (formatHeight >= 35) {
			elementOffset =
				formatHeight >= 50 ? formatHeight * 0.47 : formatHeight * 0.42;
		}

		const elementHeight = formatHeight - elementOffset;
		const elementTopPosition = formatTop + elementOffset / 2;
		let elementLeftPosition =
			formatLeft + formatWidth - formatHeight + elementOffset / 2;

		const fieldPaddingRight = parseInt(paddingRight || '0', 10);
		const fieldPaddingLeft = parseInt(paddingLeft || '0', 10);
		if (fieldPaddingRight > fieldPaddingLeft) {
			elementLeftPosition =
				formatLeft +
				formatWidth -
				formatHeight -
				(fieldPaddingRight - elementOffset + 2);
		}

		return {
			top: `${Math.round(elementTopPosition)}px`,
			left: `${Math.round(elementLeftPosition)}px`,
			height: `${Math.round(elementHeight)}px`,
			width: `${Math.round(elementHeight)}px`
		};
	}

	private getOverlayListPosition() {
		if (!this.focusedFieldData) {
			return;
		}

		const { top, left, width, height } =
			this.focusedFieldData.focusedFieldRects;
		return {
			width: `${Math.round(width || 0)}px`,
			top: `${Math.round((top || 0) + (height || 0))}px`,
			left: `${Math.round(left || 0)}px`
		};
	}

	private setFocusedFieldData(
		{ focusedFieldData }: OverlayBackgroundExtensionMessage,
		sender: Runtime.MessageSender
	) {
		this.focusedFieldData = { ...focusedFieldData, tabId: sender.tab?.id };
	}

	private updateOverlayHidden({ display }: OverlayBackgroundExtensionMessage) {
		if (!display) {
			return;
		}

		const portMessage = { command: 'updateOverlayHidden', styles: { display } };

		this.overlayButtonPort?.postMessage(portMessage);
		this.overlayListPort?.postMessage(portMessage);
	}

	private async openOverlay(
		isFocusingFieldElement = false,
		isOpeningFullOverlay = false
	) {
		const currentTab = await getTabFromCurrentWindowId();
		if (!currentTab?.id) {
			return;
		}
		await browser.tabs.sendMessage(currentTab?.id, {
			command: 'openAutofillOverlay',
			data: {
				isFocusingFieldElement,
				isOpeningFullOverlay,
				authStatus: await this.getAuthStatus()
			}
		});
	}

	private async getOverlayVisibility(): Promise<InlineMenuVisibilitySetting> {
		return AutofillOverlayVisibility.OnFieldFocus;
	}

	private async getAuthStatus() {
		const formerAuthStatus = this.userAuthStatus;
		this.userAuthStatus = await this.authService.getAuthStatus();

		if (
			this.userAuthStatus !== formerAuthStatus &&
			this.userAuthStatus === AuthenticationStatus.Unlocked
		) {
			this.updateOverlayButtonAuthStatus();
			await this.updateOverlayCiphers();
		}

		return this.userAuthStatus;
	}

	private updateOverlayButtonAuthStatus() {
		this.overlayButtonPort?.postMessage({
			command: 'updateOverlayButtonAuthStatus',
			authStatus: this.userAuthStatus
		});
	}
	private handleOverlayButtonClicked(port: Runtime.Port) {
		if (this.userAuthStatus !== AuthenticationStatus.Unlocked) {
			this.unlockVault(port);
			return;
		}
		this.openOverlay(false, true);
	}

	private async unlockVault(port: Runtime.Port) {
		this.closeOverlay(port);
		const currentTab = await getTabFromCurrentWindowId();
		if (!currentTab?.id) {
			return;
		}
		browser.tabs.sendMessage(currentTab.id!, {
			url: currentTab.url,
			type: 'toggle-slider',
			show: true
		});
	}

	private async viewSelectedCipher(
		// eslint-disable-next-line no-empty-pattern
		{}: OverlayPortMessage,
		// eslint-disable-next-line no-empty-pattern
		{}: Runtime.Port
	) {}

	private focusOverlayList() {
		this.overlayListPort?.postMessage({ command: 'focusOverlayList' });
	}

	private async unlockCompleted(message: OverlayBackgroundExtensionMessage) {
		await this.getAuthStatus();

		if (
			message.data?.commandToRetry?.message?.command === 'openAutofillOverlay'
		) {
			await this.openOverlay(true);
		}
	}

	/**
	 * Gets the translations for the overlay page.
	 */
	private getTranslations() {
		if (!this.overlayPageTranslations) {
			this.overlayPageTranslations = {};
		}
		return this.overlayPageTranslations;
	}

	/**
	 * Facilitates redirecting focus out of one of the
	 *  overlay elements to elements on the page.
	 *
	 * @param direction - The direction to redirect focus to (either "next", "previous" or "current)
	 * @param sender - The sender of the port message
	 */
	private redirectOverlayFocusOut(
		{ direction }: OverlayPortMessage,
		{ sender }: Runtime.Port
	) {
		if (!direction || !sender?.tab?.id) {
			return;
		}

		// FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
		// eslint-disable-next-line @typescript-eslint/no-floating-promises
		// BrowserApi.tabSendMessageData(sender.tab, 'redirectOverlayFocusOut', {
		// 	direction
		// });
		browser.tabs.sendMessage(sender.tab.id, {
			command: 'redirectOverlayFocusOut',
			direction
		});
	}

	/**
	 * Triggers adding a new vault item from the overlay. Gathers data
	 * input by the user before calling to open the add/edit window.
	 *
	 * @param sender - The sender of the port message
	 */
	private getNewVaultItemDetails({ sender }: Runtime.Port) {
		if (!sender?.tab?.id) {
			return;
		}
		browser.tabs.sendMessage(sender?.tab.id, {
			command: 'addNewVaultItemFromOverlay'
		});
	}

	/**
	 * Handles adding a new vault item from the overlay. Gathers data login
	 * data captured in the extension message.
	 *
	 * @param login - The login data captured from the extension message
	 * @param sender - The sender of the extension message
	 */
	private async addNewVaultItem(
		{ login }: OverlayAddNewItemMessage,
		sender: Runtime.MessageSender
	) {
		if (!login) {
			return;
		}

		if (!sender?.tab?.id) {
			return;
		}
		browser.tabs.sendMessage(sender?.tab.id, {
			type: 'frontAddNewVaultItem',
			url: login.uri,
			password: login.password,
			username: login.username
		});
	}

	/**
	 * Sets up the extension message listeners for the overlay.
	 */
	private setupExtensionMessageListeners() {
		chrome.runtime.onMessage.addListener(this.handleExtensionMessage);
		browser.runtime.onConnect.addListener(this.handlePortOnConnect);
	}

	/**
	 * Handles extension messages sent to the extension background.
	 *
	 * @param message - The message received from the extension
	 * @param sender - The sender of the message
	 * @param sendResponse - The response to send back to the sender
	 */
	private handleExtensionMessage = (
		message: OverlayBackgroundExtensionMessage,
		sender: chrome.runtime.MessageSender,
		sendResponse: (response?: any) => void
	) => {
		const handler: CallableFunction | undefined =
			this.extensionMessageHandlers[message?.type];

		if (!handler) {
			return false;
		}

		const messageResponse = handler({ message, sender });
		if (!messageResponse) {
			return false;
		}

		// FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
		// eslint-disable-next-line @typescript-eslint/no-floating-promises
		Promise.resolve(messageResponse).then((response) => sendResponse(response));
		return true;
	};
	private handlePortOnConnect = async (port: Runtime.Port) => {
		const isOverlayListPort = port.name === AutofillOverlayPort.List;
		const isOverlayButtonPort = port.name === AutofillOverlayPort.Button;
		if (!isOverlayListPort && !isOverlayButtonPort) {
			return;
		}
		this.storeOverlayPort(port);
		port.onMessage.addListener(this.handleOverlayElementPortMessage);
		const command = `initAutofillOverlay${
			isOverlayListPort ? 'List' : 'Button'
		}`;
		port.postMessage({
			command,
			authStatus: await this.getAuthStatus(),
			styleSheetUrl: chrome.runtime.getURL(
				`www/css/${isOverlayListPort ? 'list' : 'button'}.css`
			),
			theme: 'light',
			translations: this.getTranslations(),
			ciphers: isOverlayListPort ? await this.getOverlayCipherData() : null
		});
		this.updateOverlayPosition(
			{
				overlayElement: isOverlayListPort
					? AutofillOverlayElement.List
					: AutofillOverlayElement.Button
			},
			port.sender
		);
	};

	private storeOverlayPort(port: Runtime.Port) {
		if (port.name === AutofillOverlayPort.List) {
			this.storeExpiredOverlayPort(this.overlayListPort);
			this.overlayListPort = port;
			return;
		}

		if (port.name === AutofillOverlayPort.Button) {
			this.storeExpiredOverlayPort(this.overlayButtonPort);
			this.overlayButtonPort = port;
		}
	}

	private storeExpiredOverlayPort(port: Runtime.Port | undefined) {
		if (port) {
			this.expiredPorts.push(port);
		}
	}

	/**
	 * Handles messages sent to the overlay list or button ports.
	 *
	 * @param message - The message received from the port
	 * @param port - The port that sent the message
	 */
	private handleOverlayElementPortMessage = (
		message: OverlayBackgroundExtensionMessage,
		port: Runtime.Port
	) => {
		const command = message?.command;
		let handler: CallableFunction | undefined;

		if (port.name === AutofillOverlayPort.Button) {
			handler = this.overlayButtonPortMessageHandlers[command];
		}

		if (port.name === AutofillOverlayPort.List) {
			handler = this.overlayListPortMessageHandlers[command];
		}

		if (!handler) {
			return;
		}

		handler({ message, port });
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

export default OverlayBackground;
