import { AutofillExtensionMessage } from '../interface/message';
(function () {
	const message: AutofillExtensionMessage = {
		module: 'autofill',
		type: 'triggerAutofillScriptInjection'
	};
	chrome.runtime.sendMessage(message);
})();
