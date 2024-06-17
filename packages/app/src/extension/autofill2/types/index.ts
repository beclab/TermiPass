export type ElementWithOpId<T> = T & {
	opid: string;
};

/**
 * A Form Element that we can set a value on (fill)
 */
export type FillableFormFieldElement =
	| HTMLInputElement
	| HTMLSelectElement
	| HTMLTextAreaElement;

export type FormFieldElement = FillableFormFieldElement | HTMLSpanElement;

export type FormElementWithAttribute = FormFieldElement &
	Record<string, string | undefined>;
