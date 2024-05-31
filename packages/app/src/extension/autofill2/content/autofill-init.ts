import AutofillPageDetails from '../models/autofill-page-details';
import CollectAutofillContentService from '../services/collect-autofill-content.service';
import {
	AutofillExtensionMessage,
	AutofillExtensionMessageHandlers,
	AutofillInit as AutofillInitInterface
} from './abstractions/autofill-init';

class AutofillInit implements AutofillInitInterface {
	private readonly collectAutofillContentService: CollectAutofillContentService;
	private readonly insertAutofillContentService: InsertAutofillContentService;

	private readonly extensionMessageHandlers: AutofillExtensionMessageHandlers =
		{
			collectPageDetails: ({ message }) => this.collectPageDetails(message),
			collectPageDetailsImmediately: ({ message }) =>
				this.collectPageDetails(message, true),
			fillForm: ({ message }) => this.fillForm(message),
			openAutofillOverlay: ({ message }) => this.openAutofillOverlay(message),
			closeAutofillOverlay: ({ message }) =>
				this.removeAutofillOverlay(message),
			addNewVaultItemFromOverlay: () => this.addNewVaultItemFromOverlay(),
			redirectOverlayFocusOut: ({ message }) =>
				this.redirectOverlayFocusOut(message),
			updateIsOverlayCiphersPopulated: ({ message }) =>
				this.updateIsOverlayCiphersPopulated(message),
			bgUnlockPopoutOpened: () => this.blurAndRemoveOverlay(),
			bgVaultItemRepromptPopoutOpened: () => this.blurAndRemoveOverlay(),
			updateAutofillOverlayVisibility: ({ message }) =>
				this.updateAutofillOverlayVisibility(message)
		};

	init(): void {
		throw new Error('Method not implemented.');
	}
	destroy(): void {
		throw new Error('Method not implemented.');
	}

	/**
	 * Sets up the extension message listeners for the content script.
	 */
	private setupExtensionMessageListeners() {
		chrome.runtime.onMessage.addListener(this.handleExtensionMessage);
	}

	/**
	 * Handles the extension messages sent to the content script.
	 *
	 * @param message - The extension message.
	 * @param sender - The message sender.
	 * @param sendResponse - The send response callback.
	 */
	private handleExtensionMessage = (
		message: AutofillExtensionMessage,
		sender: chrome.runtime.MessageSender,
		sendResponse: (response?: any) => void
	): boolean => {
		const command: string = message.command;
		const handler: CallableFunction | undefined =
			this.extensionMessageHandlers[command];
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

	private async collectPageDetails(
		message: AutofillExtensionMessage,
		sendDetailsInResponse = false
	): Promise<AutofillPageDetails | void> {
		const pageDetails: AutofillPageDetails =
			await this.collectAutofillContentService.getPageDetails();
		if (sendDetailsInResponse) {
			return pageDetails;
		}

		// FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
		// eslint-disable-next-line @typescript-eslint/no-floating-promises
		chrome.runtime.sendMessage({
			command: 'collectPageDetailsResponse',
			tab: message.tab,
			details: pageDetails,
			sender: message.sender
		});
	}

	/**
	 * Fills the form with the given fill script.
	 *
	 * @param {AutofillExtensionMessage} message
	 */
	private async fillForm({
		fillScript,
		pageDetailsUrl
	}: AutofillExtensionMessage) {
		if ((document.defaultView || window).location.href !== pageDetailsUrl) {
			return;
		}

		this.blurAndRemoveOverlay();
		this.updateOverlayIsCurrentlyFilling(true);
		await this.insertAutofillContentService.fillForm(fillScript);

		if (!this.autofillOverlayContentService) {
			return;
		}

		setTimeout(() => this.updateOverlayIsCurrentlyFilling(false), 250);
	}

	/**
	 * Handles updating the overlay is currently filling value.
	 *
	 * @param isCurrentlyFilling - Indicates if the overlay is currently filling
	 */
	private updateOverlayIsCurrentlyFilling(isCurrentlyFilling: boolean) {
		if (!this.autofillOverlayContentService) {
			return;
		}

		this.autofillOverlayContentService.isCurrentlyFilling = isCurrentlyFilling;
	}

	/**
	 * Opens the autofill overlay.
	 *
	 * @param data - The extension message data.
	 */
	private openAutofillOverlay({ data }: AutofillExtensionMessage) {
		if (!this.autofillOverlayContentService) {
			return;
		}

		this.autofillOverlayContentService.openAutofillOverlay(data);
	}

	/**
	 * Removes the autofill overlay if the field is not currently focused.
	 * If the autofill is currently filling, only the overlay list will be
	 * removed.
	 */
	private removeAutofillOverlay(message?: AutofillExtensionMessage) {
		if (message?.data?.forceCloseOverlay) {
			this.autofillOverlayContentService?.removeAutofillOverlay();
			return;
		}

		if (
			!this.autofillOverlayContentService ||
			this.autofillOverlayContentService.isFieldCurrentlyFocused
		) {
			return;
		}

		if (this.autofillOverlayContentService.isCurrentlyFilling) {
			this.autofillOverlayContentService.removeAutofillOverlayList();
			return;
		}

		this.autofillOverlayContentService.removeAutofillOverlay();
	}

	/**
	 * Adds a new vault item from the overlay.
	 */
	private addNewVaultItemFromOverlay() {
		if (!this.autofillOverlayContentService) {
			return;
		}

		this.autofillOverlayContentService.addNewVaultItem();
	}

	/**
	 * Redirects the overlay focus out of an overlay iframe.
	 *
	 * @param data - Contains the direction to redirect the focus.
	 */
	private redirectOverlayFocusOut({ data }: AutofillExtensionMessage) {
		if (!this.autofillOverlayContentService) {
			return;
		}

		this.autofillOverlayContentService.redirectOverlayFocusOut(data?.direction);
	}

	/**
	 * Updates whether the current tab has ciphers that can populate the overlay list
	 *
	 * @param data - Contains the isOverlayCiphersPopulated value
	 *
	 */
	private updateIsOverlayCiphersPopulated({ data }: AutofillExtensionMessage) {
		if (!this.autofillOverlayContentService) {
			return;
		}

		this.autofillOverlayContentService.isOverlayCiphersPopulated = Boolean(
			data?.isOverlayCiphersPopulated
		);
	}

	/**
	 * Blurs the most recent overlay field and removes the overlay. Used
	 * in cases where the background unlock or vault item reprompt popout
	 * is opened.
	 */
	private blurAndRemoveOverlay() {
		if (!this.autofillOverlayContentService) {
			return;
		}

		this.autofillOverlayContentService.blurMostRecentOverlayField();
		this.removeAutofillOverlay();
	}

	/**
	 * Updates the autofill overlay visibility.
	 *
	 * @param data - Contains the autoFillOverlayVisibility value
	 */
	private updateAutofillOverlayVisibility({ data }: AutofillExtensionMessage) {
		if (
			!this.autofillOverlayContentService ||
			isNaN(data?.autofillOverlayVisibility)
		) {
			return;
		}

		this.autofillOverlayContentService.autofillOverlayVisibility =
			data?.autofillOverlayVisibility;
	}
}
export default AutofillInit;
