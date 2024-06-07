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
			'bitwardenOverlayButton',
			'bitwardenOverlayMenuAvailable'
		);
	}
}

export default AutofillOverlayButtonIframe;
