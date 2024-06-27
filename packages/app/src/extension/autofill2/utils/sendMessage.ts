import { AutoFillTypeMessage } from '../interface/message';
import { browser } from 'webextension-polyfill-ts';

/**
 * Sends a message to the extension.
 *
 * @param command - The command to send.
 * @param options - The options to send with the command.
 */
export const sendExtensionMessage = async (
	type: AutoFillTypeMessage,
	options: Record<string, any> = {}
): Promise<any | void> => {
	return new Promise(async (resolve) => {
		const response = await browser.runtime.sendMessage(
			null,
			Object.assign({ type, module: 'autofill' }, options)
		);
		resolve(response);
	});
};
