import { ExtensionMessage } from '../../interface/message';

export interface AutofillExtensionMessage extends ExtensionMessage {
	info?: any;
	type: AutoFillTypeMessage;
	sender?: any;
}

export type AutoFillTypeMessage =
	| 'triggerAutofillScriptInjection'
	| 'bgCollectPageDetails'
	| 'autofillOverlayElementClosed'
	| 'autofillOverlayAddNewVaultItem'
	| 'checkAutofillOverlayFocused'
	| 'focusAutofillOverlayList'
	| 'openAutofillOverlay'
	| 'updateAutofillOverlayPosition'
	| 'updateAutofillOverlayHidden'
	| 'updateFocusedFieldData'
	| 'getAutofillOverlayVisibility'
	| 'getUseTreeWalkerApiForPageDetailsCollectionFeatureFlag';
