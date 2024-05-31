import { AutofillOverlayElement } from '../../../utils';
import AutofillOverlayButton from './autofill-overlay-button';

require('./button.scss');

(function () {
	globalThis.customElements.define(
		AutofillOverlayElement.Button,
		AutofillOverlayButton
	);
})();
