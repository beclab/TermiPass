import { FillableFormFieldElement, FormFieldElement } from '../types';

export enum AuthenticationStatus {
	LoggedOut = 0,
	Locked = 1,
	Unlocked = 2
}

export enum CipherType {
	Login = 1,
	SecureNote = 2,
	Card = 3,
	Identity = 4
}

export enum CipherRepromptType {
	None = 0,
	Password = 1
}

export type OverlayCipherData = {
	id: string;
	name: string;
	type: CipherType;
	reprompt: CipherRepromptType;
	favorite: boolean;
	icon: {
		imageEnabled: boolean;
		image: string;
		fallbackImage: string;
		icon: string;
	};
	login?: { username: string };
	card?: string;
};

export const EVENTS = {
	CHANGE: 'change',
	INPUT: 'input',
	KEYDOWN: 'keydown',
	KEYPRESS: 'keypress',
	KEYUP: 'keyup',
	BLUR: 'blur',
	CLICK: 'click',
	FOCUS: 'focus',
	SCROLL: 'scroll',
	RESIZE: 'resize',
	DOMCONTENTLOADED: 'DOMContentLoaded',
	LOAD: 'load',
	MESSAGE: 'message',
	VISIBILITYCHANGE: 'visibilitychange',
	FOCUSOUT: 'focusout'
} as const;

export const RedirectFocusDirection = {
	Current: 'current',
	Previous: 'previous',
	Next: 'next'
} as const;

export const buildSvgDomElement = (svgString: string, ariaHidden = true) => {
	const domParser = new DOMParser();
	const svgDom = domParser.parseFromString(svgString, 'image/svg+xml');
	const domElement = svgDom.documentElement;
	domElement.setAttribute('aria-hidden', `${ariaHidden}`);

	return domElement;
};

export const AutofillOverlayElement = {
	Button: 'autofill-overlay-button',
	List: 'autofill-overlay-list'
} as const;

/**
 * Identifies whether an element is an instance of a specific tag name.
 *
 * @param element - The element to check.
 * @param tagName -  The tag name to check against.
 */
function elementIsInstanceOf<T extends Element>(
	element: Element,
	tagName: string
): element is T {
	return element?.tagName.toLowerCase() === tagName;
}

/**
 * Identifies whether an element is a span element.
 *
 * @param element - The element to check.
 */
export const elementIsSpanElement = (
	element: Element
): element is HTMLSpanElement => {
	return elementIsInstanceOf<HTMLSpanElement>(element, 'span');
};

/**
 * Identifies whether an element is a select field.
 *
 * @param element - The element to check.
 */
export const elementIsSelectElement = (
	element: Element
): element is HTMLSelectElement => {
	return elementIsInstanceOf<HTMLSelectElement>(element, 'select');
};

/**
 * Identifies whether an element is an input field.
 *
 * @param element - The element to check.
 */
export const elementIsInputElement = (
	element: Element
): element is HTMLInputElement => {
	return elementIsInstanceOf<HTMLInputElement>(element, 'input');
};

/**
 * Identifies whether an element is a textarea field.
 *
 * @param element - The element to check.
 */
export const elementIsTextAreaElement = (
	element: Element
): element is HTMLTextAreaElement => {
	return elementIsInstanceOf<HTMLTextAreaElement>(element, 'textarea');
};

/**
 * Identifies whether an element is a label element.
 *
 * @param element - The element to check.
 */
export const elementIsLabelElement = (
	element: Element
): element is HTMLLabelElement => {
	return elementIsInstanceOf<HTMLLabelElement>(element, 'label');
};

/**
 * Identifies whether an element is a description details `dd` element.
 *
 * @param element - The element to check.
 */
export const elementIsDescriptionDetailsElement = (
	element: Element
): element is HTMLElement => {
	return elementIsInstanceOf<HTMLElement>(element, 'dd');
};

/**
 * Identifies whether an element is a description term `dt` element.
 *
 * @param element - The element to check.
 */
export const elementIsDescriptionTermElement = (
	element: Element
): element is HTMLElement => {
	return elementIsInstanceOf<HTMLElement>(element, 'dt');
};

/**
 * Identifies whether a node is an HTML element.
 *
 * @param node - The node to check.
 */
export const nodeIsElement = (node: Node): node is Element => {
	return node?.nodeType === Node.ELEMENT_NODE;
};

/**
 * Identifies whether an element is a fillable form field.
 * This is determined by whether the element is a form field and not a span.
 *
 * @param formFieldElement - The form field element to check.
 */
export const elementIsFillableFormField = (
	formFieldElement: FormFieldElement
): formFieldElement is FillableFormFieldElement => {
	return formFieldElement?.tagName.toLowerCase() !== 'span';
};

/**
 * Identifies whether an element is a form element.
 *
 * @param element - The element to check.
 */
export const elementIsFormElement = (
	element: Element
): element is HTMLFormElement => {
	return elementIsInstanceOf<HTMLFormElement>(element, 'form');
};

/**
 * Identifies whether a node is a form element.
 *
 * @param node - The node to check.
 */
export const nodeIsFormElement = (node: Node): node is HTMLFormElement => {
	return nodeIsElement(node) && elementIsFormElement(node);
};
