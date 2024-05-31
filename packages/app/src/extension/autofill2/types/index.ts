export type ElementWithOpId<T> = T & {
	opid: string;
};

/**
 * A Form Element that we can set a value on (fill)
 */
export type FillableFormFieldElement =
	| HTMLInputElement
	| HTMLSelectElement
	| HTMLTextAreaElement;

export type FormFieldElement = FillableFormFieldElement | HTMLSpanElement;

export type FormElementWithAttribute = FormFieldElement &
	Record<string, string | undefined>;

/**
 * Sends a message to the extension.
 *
 * @param command - The command to send.
 * @param options - The options to send with the command.
 */
export const sendExtensionMessage = (
	command: string,
	options: Record<string, any> = {}
): Promise<any | void> => {
	return new Promise((resolve) => {
		chrome.runtime.sendMessage(
			Object.assign({ command }, options),
			(response) => {
				if (chrome.runtime.lastError) {
					return;
				}

				resolve(response);
			}
		);
	});
};
