import { AutofillOverlayElement } from '../../../utils';
import AutofillOverlayList from './autofill-overlay-list';

require('./list.scss');

(function () {
	globalThis.customElements.define(
		AutofillOverlayElement.List,
		AutofillOverlayList
	);
})();
