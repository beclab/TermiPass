import AutofillField from '../../models/autofill-field';
import AutofillForm from '../../models/autofill-form';
import AutofillPageDetails from '../../models/autofill-page-details';
import { ElementWithOpId, FormFieldElement } from '../../types';

export type AutofillFormElements = Map<
	ElementWithOpId<HTMLFormElement>,
	AutofillForm
>;

export type AutofillFieldElements = Map<
	ElementWithOpId<FormFieldElement>,
	AutofillField
>;

export type UpdateAutofillDataAttributeParams = {
	element: ElementWithOpId<HTMLFormElement | FormFieldElement>;
	attributeName: string;
	dataTarget?: AutofillForm | AutofillField;
	dataTargetKey?: string;
};

export interface CollectAutofillContentService {
	getPageDetails(): Promise<AutofillPageDetails>;
	getAutofillFieldElementByOpid(opid: string): HTMLElement | null;
	queryAllTreeWalkerNodes(
		rootNode: Node,
		filterCallback: CallableFunction,
		isObservingShadowRoot?: boolean
	): Node[];
	destroy(): void;
}
