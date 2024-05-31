import AutofillField from '../../models/autofill-field';
import { ElementWithOpId, FormFieldElement } from '../../types';
import { AuthenticationStatus } from '../../utils';

export type OpenAutofillOverlayOptions = {
	isFocusingFieldElement?: boolean;
	isOpeningFullOverlay?: boolean;
	authStatus?: AuthenticationStatus;
};

export interface AutofillOverlayContentService {
	isFieldCurrentlyFocused: boolean;
	isCurrentlyFilling: boolean;
	isOverlayCiphersPopulated: boolean;
	pageDetailsUpdateRequired: boolean;
	autofillOverlayVisibility: number;
	init(): void;
	setupAutofillOverlayListenerOnField(
		autofillFieldElement: ElementWithOpId<FormFieldElement>,
		autofillFieldData: AutofillField
	): Promise<void>;
	openAutofillOverlay(options: OpenAutofillOverlayOptions): void;
	removeAutofillOverlay(): void;
	removeAutofillOverlayButton(): void;
	removeAutofillOverlayList(): void;
	addNewVaultItem(): void;
	redirectOverlayFocusOut(direction: 'previous' | 'next'): void;
	focusMostRecentOverlayField(): void;
	blurMostRecentOverlayField(): void;
	destroy(): void;
}
