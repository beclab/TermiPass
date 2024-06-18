import { AuthenticationStatus } from 'src/extension/utils/enums';
import AutofillScript from '../../models/autofill-script';

export type AutofillExtensionMessage = {
	command: string;
	tab?: chrome.tabs.Tab;
	sender?: string;
	fillScript?: AutofillScript;
	url?: string;
	pageDetailsUrl?: string;
	ciphers?: any;
	data?: {
		authStatus?: AuthenticationStatus;
		isFocusingFieldElement?: boolean;
		isOverlayCiphersPopulated?: boolean;
		direction?: 'previous' | 'next';
		isOpeningFullOverlay?: boolean;
		forceCloseOverlay?: boolean;
		autofillOverlayVisibility?: number;
	};
};

export type AutofillExtensionMessageParam = {
	message: AutofillExtensionMessage;
};

export type AutofillExtensionMessageHandlers = {
	[key: string]: CallableFunction;
	collectPageDetails: ({ message }: AutofillExtensionMessageParam) => void;
	collectPageDetailsImmediately: ({
		message
	}: AutofillExtensionMessageParam) => void;
	fillForm: ({ message }: AutofillExtensionMessageParam) => void;
	openAutofillOverlay: ({ message }: AutofillExtensionMessageParam) => void;
	closeAutofillOverlay: ({ message }: AutofillExtensionMessageParam) => void;
	addNewVaultItemFromOverlay: () => void;
	redirectOverlayFocusOut: ({ message }: AutofillExtensionMessageParam) => void;
	updateIsOverlayCiphersPopulated: ({
		message
	}: AutofillExtensionMessageParam) => void;
	bgUnlockPopoutOpened: () => void;
	bgVaultItemRepromptPopoutOpened: () => void;
	updateAutofillOverlayVisibility: ({
		message
	}: AutofillExtensionMessageParam) => void;
};

export interface AutofillInit {
	init(): void;
	destroy(): void;
}