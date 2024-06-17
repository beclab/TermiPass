import AutofillOverlayContentService from '../services/autofill-overlay-content.service';
import { setupAutofillInitDisconnectAction } from '../utils';

import AutofillInit from './autofill-init';

(function (windowContext) {
	if (!windowContext.termipassAutofillInit) {
		const autofillOverlayContentService = new AutofillOverlayContentService();
		windowContext.termipassAutofillInit = new AutofillInit(
			autofillOverlayContentService
		);
		setupAutofillInitDisconnectAction(windowContext);

		windowContext.termipassAutofillInit.init();
	}
})(window);
