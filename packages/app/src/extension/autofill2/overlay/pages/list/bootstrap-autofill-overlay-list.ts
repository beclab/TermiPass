import '@webcomponents/custom-elements';
import AutofillOverlayList from './autofill-overlay-list';
import { AutofillOverlayElement } from 'src/extension/autofill2/utils/autofill-overlay.enum';

require('./list.scss');

(function () {
	globalThis.customElements.define(
		AutofillOverlayElement.List,
		AutofillOverlayList
	);
})();
