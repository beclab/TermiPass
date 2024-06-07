import '@webcomponents/custom-elements';
import AutofillOverlayButton from './autofill-overlay-button';
import { AutofillOverlayElement } from 'src/extension/autofill2/utils/autofill-overlay.enum';

require('./button.scss');

(function () {
	globalThis.customElements.define(
		AutofillOverlayElement.Button,
		AutofillOverlayButton
	);
})();
