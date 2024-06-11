import { Runtime } from 'webextension-polyfill-ts';
import AutofillPageDetails from '../../models/autofill-page-details';
import { CipherRepromptType, CipherType } from '../../utils';

type WebsiteIconData = {
	imageEnabled: boolean;
	image: string;
	fallbackImage: string;
	icon: string;
};

type FocusedFieldData = {
	focusedFieldStyles: Partial<CSSStyleDeclaration>;
	focusedFieldRects: Partial<DOMRect>;
	tabId?: number;
};

interface OverlayBackground {
	init(): Promise<void>;
	removePageDetails(tabId: number): void;
	updateOverlayCiphers(): void;
}

type OverlayAddNewItemMessage = {
	login?: {
		uri?: string;
		hostname: string;
		username: string;
		password: string;
	};
};

type OverlayPortMessage = {
	[key: string]: any;
	command: string;
	direction?: string;
	overlayCipherId?: string;
};

type OverlayBackgroundExtensionMessage = {
	[key: string]: any;
	type: string;
	tab?: chrome.tabs.Tab;
	sender?: string;
	details?: AutofillPageDetails;
	overlayElement?: string;
	display?: string;
	// data?: LockedVaultPendingNotificationsData;
} & OverlayAddNewItemMessage;

type BackgroundMessageParam = {
	message: OverlayBackgroundExtensionMessage;
};
type BackgroundSenderParam = {
	sender: Runtime.MessageSender;
};

type BackgroundOnMessageHandlerParams = BackgroundMessageParam &
	BackgroundSenderParam;

type OverlayBackgroundExtensionMessageHandlers = {
	[key: string]: CallableFunction;
	openAutofillOverlay: () => void;
	autofillOverlayElementClosed: ({
		message,
		sender
	}: BackgroundOnMessageHandlerParams) => void;
	autofillOverlayAddNewVaultItem: ({
		message,
		sender
	}: BackgroundOnMessageHandlerParams) => void;
	getAutofillOverlayVisibility: () => void;
	checkAutofillOverlayFocused: () => void;
	focusAutofillOverlayList: () => void;
	updateAutofillOverlayPosition: ({
		message,
		sender
	}: BackgroundOnMessageHandlerParams) => void;
	updateAutofillOverlayHidden: ({ message }: BackgroundMessageParam) => void;
	updateFocusedFieldData: ({
		message,
		sender
	}: BackgroundOnMessageHandlerParams) => void;
	collectPageDetailsResponse: ({
		message,
		sender
	}: BackgroundOnMessageHandlerParams) => void;
	unlockCompleted: ({ message }: BackgroundMessageParam) => void;
	addEditCipherSubmitted: () => void;
	deletedCipher: () => void;
};

type OverlayCipherData = {
	id: string;
	name: string;
	type: CipherType;
	reprompt: CipherRepromptType;
	favorite: boolean;
	icon: {
		imageEnabled: boolean;
		image: string;
		fallbackImage: string;
		icon: string;
	};
	login?: { username: string };
	card?: string;
};

type PortMessageParam = {
	message: OverlayPortMessage;
};
type PortConnectionParam = {
	port: Runtime.Port;
};

type PortOnMessageHandlerParams = PortMessageParam & PortConnectionParam;

type OverlayButtonPortMessageHandlers = {
	[key: string]: CallableFunction;
	overlayButtonClicked: ({ port }: PortConnectionParam) => void;
	closeAutofillOverlay: ({ port }: PortConnectionParam) => void;
	forceCloseAutofillOverlay: ({ port }: PortConnectionParam) => void;
	overlayPageBlurred: () => void;
	redirectOverlayFocusOut: ({
		message,
		port
	}: PortOnMessageHandlerParams) => void;
};

type OverlayListPortMessageHandlers = {
	[key: string]: CallableFunction;
	checkAutofillOverlayButtonFocused: () => void;
	forceCloseAutofillOverlay: ({ port }: PortConnectionParam) => void;
	overlayPageBlurred: () => void;
	unlockVault: ({ port }: PortConnectionParam) => void;
	fillSelectedListItem: ({ message, port }: PortOnMessageHandlerParams) => void;
	addNewVaultItem: ({ port }: PortConnectionParam) => void;
	viewSelectedCipher: ({ message, port }: PortOnMessageHandlerParams) => void;
	redirectOverlayFocusOut: ({
		message,
		port
	}: PortOnMessageHandlerParams) => void;
};

export {
	WebsiteIconData,
	OverlayBackgroundExtensionMessage,
	OverlayPortMessage,
	FocusedFieldData,
	OverlayCipherData,
	OverlayAddNewItemMessage,
	OverlayBackgroundExtensionMessageHandlers,
	OverlayButtonPortMessageHandlers,
	OverlayListPortMessageHandlers,
	OverlayBackground
};
