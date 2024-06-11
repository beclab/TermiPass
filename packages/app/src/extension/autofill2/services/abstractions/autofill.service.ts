import { Tabs } from 'webextension-polyfill-ts';
import AutofillField from '../../models/autofill-field';
import AutofillForm from '../../models/autofill-form';
import AutofillPageDetails from '../../models/autofill-page-details';
import { VaultItem } from '@didvault/sdk/src/core';

export enum CipherType {
	Login = 1,
	SecureNote = 2,
	Card = 3,
	Identity = 4
}

export enum UriMatchType {
	Domain = 0,
	Host = 1,
	StartsWith = 2,
	Exact = 3,
	RegularExpression = 4,
	Never = 5
}

export interface PageDetail {
	frameId: number;
	tab: Tabs.Tab;
	details: AutofillPageDetails;
}

export interface AutoFillOptions {
	item: VaultItem;
	pageDetails: PageDetail[];
	doc?: typeof self.document;
	tab: Tabs.Tab;
	skipUsernameOnlyFill?: boolean;
	onlyEmptyFields?: boolean;
	onlyVisibleFields?: boolean;
	fillNewPassword?: boolean;
	skipLastUsed?: boolean;
	allowUntrustedIframe?: boolean;
	allowTotpAutofill?: boolean;
}

export interface FormData {
	form: AutofillForm;
	password: AutofillField;
	username: AutofillField;
	passwords: AutofillField[];
}

export const UriMatchStrategy = {
	Domain: 0,
	Host: 1,
	StartsWith: 2,
	Exact: 3,
	RegularExpression: 4,
	Never: 5
} as const;

export type UriMatchStrategySetting =
	(typeof UriMatchStrategy)[keyof typeof UriMatchStrategy];

export interface GenerateFillScriptOptions {
	skipUsernameOnlyFill: boolean;
	onlyEmptyFields: boolean;
	onlyVisibleFields: boolean;
	fillNewPassword: boolean;
	allowTotpAutofill: boolean;
	item: VaultItem;
	tabUrl: string;
	defaultUriMatch: UriMatchStrategySetting;
}

export abstract class AutofillService {
	// loadAutofillScriptsOnInstall: () => Promise<void>;
	reloadAutofillScripts: () => Promise<void>;
	injectAutofillScripts: (
		tab: Tabs.Tab,
		frameId?: number,
		triggeringOnPageLoad?: boolean
	) => Promise<void>;
	getFormsWithPasswordFields: (pageDetails: AutofillPageDetails) => FormData[];
	doAutoFill: (options: AutoFillOptions) => Promise<string | null>;
	doAutoFillOnTab: (
		pageDetails: PageDetail[],
		tab: chrome.tabs.Tab,
		fromCommand: boolean
	) => Promise<string | null>;
	// doAutoFillActiveTab: (
	// 	pageDetails: PageDetail[],
	// 	fromCommand: boolean,
	// 	cipherType?: CipherType
	// ) => Promise<string | null>;
	// isPasswordRepromptRequired: (
	// 	// cipher: CipherView,
	// 	tab: chrome.tabs.Tab
	// ) => Promise<boolean>;
}
