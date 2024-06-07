import { AutofillOverlayPort } from '../../utils/autofill-overlay.enum';
import AutofillOverlayIframeElement from './autofill-overlay-iframe-element';

class AutofillOverlayButtonIframe extends AutofillOverlayIframeElement {
	constructor(element: HTMLElement) {
		super(
			element,
			'www/button.html',
			AutofillOverlayPort.Button,
			{
				background: 'transparent',
				border: 'none'
			},
			'Termipass auto-fill menu button',
			'Termipass auto-fill menu available. Press the down arrow key to select.'
		);
	}
}

export default AutofillOverlayButtonIframe;
