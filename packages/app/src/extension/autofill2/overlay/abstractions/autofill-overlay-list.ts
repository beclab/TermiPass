import { AuthenticationStatus, OverlayCipherData } from '../../utils';

type OverlayListMessage = { command: string };

type UpdateOverlayListCiphersMessage = OverlayListMessage & {
	ciphers: OverlayCipherData[];
};

type InitAutofillOverlayListMessage = OverlayListMessage & {
	authStatus: AuthenticationStatus;
	styleSheetUrl: string;
	theme: string;
	translations: Record<string, string>;
	ciphers?: OverlayCipherData[];
};

type OverlayListWindowMessageHandlers = {
	[key: string]: CallableFunction;
	initAutofillOverlayList: ({
		message
	}: {
		message: InitAutofillOverlayListMessage;
	}) => void;
	checkAutofillOverlayListFocused: () => void;
	updateOverlayListCiphers: ({
		message
	}: {
		message: UpdateOverlayListCiphersMessage;
	}) => void;
	focusOverlayList: () => void;
};

export {
	UpdateOverlayListCiphersMessage,
	InitAutofillOverlayListMessage,
	OverlayListWindowMessageHandlers
};
