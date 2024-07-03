import { setupAutofillInitDisconnectAction } from '../utils';

import AutofillInit from './autofill-init';

(function (windowContext) {
	if (!windowContext.termipassAutofillInit) {
		windowContext.termipassAutofillInit = new AutofillInit();
		setupAutofillInitDisconnectAction(windowContext);

		windowContext.termipassAutofillInit.init();
	}
})(window);
