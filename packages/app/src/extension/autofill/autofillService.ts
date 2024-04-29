import AutofillField from './autofill-field';
import AutofillPageDetails from './autofill-page-details';
import { AutoFillConstants } from './autofillConstants';
import AutofillScript from './autofill-script';
import { Field, FieldType, VaultItem } from '@didvault/sdk/src/core';
import { browser, Tabs } from 'webextension-polyfill-ts';

export interface PageDetail {
	frameId: number;
	tab: Tabs.Tab;
	details: AutofillPageDetails;
}

export interface AutoFillOptions {
	pageDetails: PageDetail[];
	doc?: typeof window.document;
	tab: Tabs.Tab;
	skipUsernameOnlyFill?: boolean;
	onlyEmptyFields?: boolean;
	onlyVisibleFields?: boolean;
	fillNewPassword?: boolean;
	skipLastUsed?: boolean;
}

export interface GenerateFillScriptOptions {
	skipUsernameOnlyFill: boolean;
	onlyEmptyFields: boolean;
	onlyVisibleFields: boolean;
	fillNewPassword: boolean;
	fields: Field[];
}

export default class AutofillService {
	async doAutoFill(options: AutoFillOptions, item: VaultItem) {
		console.log('do autofill');
		const tab = options.tab;
		if (
			!tab ||
			!options.pageDetails ||
			!options.pageDetails.length ||
			!tab.id
		) {
			throw new Error('Nothing to auto-fill.');
		}

		if (!item || item.fields.length <= 0) {
			throw new Error('auto fill fields empty');
		}

		console.log('options.pageDetails length', options.pageDetails.length);

		options.pageDetails.forEach((pd) => {
			// make sure we're still on correct tab
			if (pd.tab.id !== tab.id || pd.tab.url !== tab.url) {
				return;
			}
			const fillScript = this.generateFillScript(pd.details, {
				skipUsernameOnlyFill: options.skipUsernameOnlyFill || false,
				onlyEmptyFields: options.onlyEmptyFields || false,
				onlyVisibleFields: options.onlyVisibleFields || false,
				fillNewPassword: options.fillNewPassword || false,
				fields: item.fields
			});

			console.log('fillScript ===>', fillScript);

			if (!fillScript || !fillScript.script || !fillScript.script.length) {
				return;
			}

			// Add a small delay between operations
			fillScript.properties.delay_between_operations = 20;

			new Promise<void>((resolve, reject) => {
				if (tab.id)
					browser.tabs
						.sendMessage(
							tab.id,
							{
								command: 'fillForm',
								fillScript: fillScript,
								url: tab.url
							},
							{ frameId: pd.frameId }
						)
						.then(() => {
							resolve();
						})
						.catch((e) => {
							reject(e);
						});
			});
		});
	}

	private fillByOpid(
		fillScript: AutofillScript,
		field: AutofillField,
		value: string
	): void {
		if (field.maxLength && value && value.length > field.maxLength) {
			value = value.substr(0, value.length);
		}
		if (field.tagName !== 'span') {
			fillScript.script.push(['click_on_opid', field.opid]);
			fillScript.script.push(['focus_by_opid', field.opid]);
		}
		fillScript.script.push(['fill_by_opid', field.opid, value]);
	}

	private generateFillScript(
		pageDetails: AutofillPageDetails,
		options: GenerateFillScriptOptions
	): AutofillScript | null {
		if (!pageDetails || !options.fields) {
			return null;
		}

		const fillScript = new AutofillScript(pageDetails.documentUUID);
		const filledFields: { [id: string]: AutofillField } = {};
		const fields = options.fields;

		if (fields && fields.length) {
			const fieldNames: string[] = [];

			fields.forEach((f) => {
				if (f && f.name) {
					fieldNames.push(f.name.toLowerCase());
				}
			});

			pageDetails.fields.forEach((field) => {
				// eslint-disable-next-line
				if (filledFields.hasOwnProperty(field.opid)) {
					return;
				}

				if (!field.viewable && field.tagName !== 'span') {
					return;
				}

				const matchingIndex = this.findMatchingFieldIndex(field, fieldNames);
				if (matchingIndex > -1) {
					const matchingField = fields[matchingIndex];
					filledFields[field.opid] = field;
					this.fillByOpid(fillScript, field, matchingField.value);
				}
			});
		}

		return this.generateLoginFillScript(
			fillScript,
			pageDetails,
			filledFields,
			options
		);
	}

	private generateLoginFillScript(
		fillScript: AutofillScript,
		pageDetails: AutofillPageDetails,
		filledFields: { [id: string]: AutofillField },
		options: GenerateFillScriptOptions
	): AutofillScript | null {
		if (!options.fields) {
			return null;
		}

		const passwords: AutofillField[] = [];
		const usernames: AutofillField[] = [];
		let pf: AutofillField | null = null;
		let username: AutofillField | null = null;
		const url = options.fields.filter((v) => v.type === FieldType.Url);
		fillScript.savedUrls = url ? url.flatMap((item) => item.value) : [];

		let passwordFields = this.loadPasswordFields(
			pageDetails,
			false,
			false,
			options.onlyEmptyFields,
			options.fillNewPassword
		);
		if (!passwordFields.length && !options.onlyVisibleFields) {
			// not able to find any viewable password fields. maybe there are some "hidden" ones?
			passwordFields = this.loadPasswordFields(
				pageDetails,
				true,
				true,
				options.onlyEmptyFields,
				options.fillNewPassword
			);
		}

		for (const formKey in pageDetails.forms) {
			// eslint-disable-next-line
			if (!pageDetails.forms.hasOwnProperty(formKey)) {
				continue;
			}

			const passwordFieldsForForm: AutofillField[] = [];
			passwordFields.forEach((passField: AutofillField) => {
				if (formKey === passField.form) {
					passwordFieldsForForm.push(passField);
				}
			});

			passwordFields.forEach((passField: AutofillField) => {
				pf = passField;
				passwords.push(pf);

				username = this.findUsernameField(pageDetails, pf, false, false, false);

				if (!username && !options.onlyVisibleFields) {
					// not able to find any viewable username fields. maybe there are some "hidden" ones?
					username = this.findUsernameField(pageDetails, pf, true, true, false);
				}

				if (username) {
					usernames.push(username);
				}
			});
		}

		if (passwordFields.length && !passwords.length) {
			// The page does not have any forms with password fields. Use the first password field on the page and the
			// input field just before it as the username.

			pf = passwordFields[0];
			passwords.push(pf);

			if (pf.elementNumber > 0) {
				username = this.findUsernameField(pageDetails, pf, false, false, true);

				if (!username && !options.onlyVisibleFields) {
					// not able to find any viewable username fields. maybe there are some "hidden" ones?
					username = this.findUsernameField(pageDetails, pf, true, true, true);
				}

				if (username) {
					usernames.push(username);
				}
			}
		}

		if (!passwordFields.length && !options.skipUsernameOnlyFill) {
			// No password fields on this page. Let's try to just fuzzy fill the username.
			pageDetails.fields.forEach((f) => {
				if (
					f.viewable &&
					(f.type === 'text' || f.type === 'email' || f.type === 'tel') &&
					this.fieldIsFuzzyMatch(f, AutoFillConstants.UsernameFieldNames)
				) {
					usernames.push(f);
				}
			});
		}

		usernames.forEach((u) => {
			// eslint-disable-next-line
			if (filledFields.hasOwnProperty(u.opid)) {
				return;
			}

			filledFields[u.opid] = u;
			const userName = options.fields.find(
				(item) => item.type == FieldType.Username
			);
			if (userName != null) {
				this.fillByOpid(fillScript, u, userName.value);
			}
		});

		passwords.forEach((p) => {
			// eslint-disable-next-line
			if (filledFields.hasOwnProperty(p.opid)) {
				return;
			}

			filledFields[p.opid] = p;
			const password = options.fields.find(
				(item) => item.type == FieldType.Password
			);
			if (password) {
				this.fillByOpid(fillScript, p, password.value);
			}
		});

		fillScript = this.setFillScriptForFocus(filledFields, fillScript);
		return fillScript;
	}

	private findUsernameField(
		pageDetails: AutofillPageDetails,
		passwordField: AutofillField,
		canBeHidden: boolean,
		canBeReadOnly: boolean,
		withoutForm: boolean
	) {
		let usernameField: AutofillField | null = null;
		for (let i = 0; i < pageDetails.fields.length; i++) {
			const f = pageDetails.fields[i];
			if (this.forCustomFieldsOnly(f)) {
				continue;
			}

			if (f.elementNumber >= passwordField.elementNumber) {
				break;
			}

			if (
				!f.disabled &&
				(canBeReadOnly || !f.readonly) &&
				(withoutForm || f.form === passwordField.form) &&
				(canBeHidden || f.viewable) &&
				(f.type === 'text' || f.type === 'email' || f.type === 'tel')
			) {
				usernameField = f;

				if (
					this.findMatchingFieldIndex(f, AutoFillConstants.UsernameFieldNames) >
					-1
				) {
					// We found an exact match. No need to keep looking.
					break;
				}
			}
		}

		return usernameField;
	}

	private findMatchingFieldIndex(
		field: AutofillField,
		names: string[]
	): number {
		for (let i = 0; i < names.length; i++) {
			if (names[i].indexOf('=') > -1) {
				if (this.fieldPropertyIsPrefixMatch(field, 'htmlID', names[i], 'id')) {
					return i;
				}
				if (
					this.fieldPropertyIsPrefixMatch(field, 'htmlName', names[i], 'name')
				) {
					return i;
				}
				if (
					this.fieldPropertyIsPrefixMatch(field, 'label-tag', names[i], 'label')
				) {
					return i;
				}
				if (
					this.fieldPropertyIsPrefixMatch(
						field,
						'label-aria',
						names[i],
						'label'
					)
				) {
					return i;
				}
				if (
					this.fieldPropertyIsPrefixMatch(
						field,
						'placeholder',
						names[i],
						'placeholder'
					)
				) {
					return i;
				}
			}

			if (this.fieldPropertyIsMatch(field, 'htmlID', names[i])) {
				return i;
			}
			if (this.fieldPropertyIsMatch(field, 'htmlName', names[i])) {
				return i;
			}
			if (this.fieldPropertyIsMatch(field, 'label-tag', names[i])) {
				return i;
			}
			if (this.fieldPropertyIsMatch(field, 'label-aria', names[i])) {
				return i;
			}
			if (this.fieldPropertyIsMatch(field, 'placeholder', names[i])) {
				return i;
			}
		}

		return -1;
	}

	private fieldPropertyIsPrefixMatch(
		field: any,
		property: string,
		name: string,
		prefix: string,
		separator = '='
	): boolean {
		if (name.indexOf(prefix + separator) === 0) {
			const sepIndex = name.indexOf(separator);
			const val = name.substring(sepIndex + 1);
			return val != null && this.fieldPropertyIsMatch(field, property, val);
		}
		return false;
	}

	fieldIsFuzzyMatch(field: AutofillField, names: string[]): boolean {
		if (this.hasValue(field.htmlID) && this.fuzzyMatch(names, field.htmlID)) {
			return true;
		}
		if (
			this.hasValue(field.htmlName) &&
			this.fuzzyMatch(names, field.htmlName)
		) {
			return true;
		}
		if (
			this.hasValue(field['label-tag']) &&
			this.fuzzyMatch(names, field['label-tag'])
		) {
			return true;
		}
		if (
			this.hasValue(field.placeholder) &&
			this.fuzzyMatch(names, field.placeholder)
		) {
			return true;
		}
		if (
			this.hasValue(field['label-left']) &&
			this.fuzzyMatch(names, field['label-left'])
		) {
			return true;
		}
		if (
			this.hasValue(field['label-top']) &&
			this.fuzzyMatch(names, field['label-top'])
		) {
			return true;
		}
		if (
			this.hasValue(field['label-aria']) &&
			this.fuzzyMatch(names, field['label-aria'])
		) {
			return true;
		}

		return false;
	}

	fuzzyMatch(options: string[], value: string): boolean {
		if (
			options == null ||
			options.length === 0 ||
			value == null ||
			value === ''
		) {
			return false;
		}

		value = value
			.replace(/(?:\r\n|\r|\n)/g, '')
			.trim()
			.toLowerCase();

		for (let i = 0; i < options.length; i++) {
			if (value.indexOf(options[i]) > -1) {
				return true;
			}
		}

		return false;
	}

	private fieldPropertyIsMatch(
		field: any,
		property: string,
		name: string
	): boolean {
		let fieldVal = field[property] as string;
		if (!this.hasValue(fieldVal)) {
			return false;
		}

		fieldVal = fieldVal.trim().replace(/(?:\r\n|\r|\n)/g, '');
		if (name.startsWith('regex=')) {
			try {
				const regexParts = name.split('=', 2);
				if (regexParts.length === 2) {
					const regex = new RegExp(regexParts[1], 'i');
					return regex.test(fieldVal);
				}
			} catch (e) {
				console.log(e);
			}
		} else if (name.startsWith('csv=')) {
			const csvParts = name.split('=', 2);
			if (csvParts.length === 2) {
				const csvVals = csvParts[1].split(',');
				for (let i = 0; i < csvVals.length; i++) {
					const val = csvVals[i];
					if (
						val != null &&
						val.trim().toLowerCase() === fieldVal.toLowerCase()
					) {
						return true;
					}
				}
				return false;
			}
		}
		return fieldVal.toLowerCase() === name;
	}

	private forCustomFieldsOnly(field: AutofillField): boolean {
		return field.tagName === 'span';
	}

	private loadPasswordFields(
		pageDetails: AutofillPageDetails,
		canBeHidden: boolean,
		canBeReadOnly: boolean,
		mustBeEmpty: boolean,
		fillNewPassword: boolean
	) {
		const arr: AutofillField[] = [];
		pageDetails.fields.forEach((f) => {
			if (this.forCustomFieldsOnly(f)) {
				return;
			}

			const isPassword = f.type === 'password';
			const valueIsLikePassword = (value: string) => {
				if (value == null) {
					return false;
				}
				// Removes all whitespace, _ and - characters
				// eslint-disable-next-line
				const cleanedValue = value.toLowerCase().replace(/[\s_\-]/g, '');

				if (cleanedValue.indexOf('password') < 0) {
					return false;
				}

				if (
					AutoFillConstants.PasswordFieldIgnoreList.some(
						(i) => cleanedValue.indexOf(i) > -1
					)
				) {
					return false;
				}

				return true;
			};
			const isLikePassword = () => {
				if (f.type !== 'text') {
					return false;
				}
				if (valueIsLikePassword(f.htmlID)) {
					return true;
				}
				if (valueIsLikePassword(f.htmlName)) {
					return true;
				}
				if (valueIsLikePassword(f.placeholder)) {
					return true;
				}
				return false;
			};
			if (
				!f.disabled &&
				(canBeReadOnly || !f.readonly) &&
				(isPassword || isLikePassword()) &&
				(canBeHidden || f.viewable) &&
				(!mustBeEmpty || f.value == null || f.value.trim() === '') &&
				(fillNewPassword || f.autoCompleteType !== 'new-password')
			) {
				arr.push(f);
			}
		});
		return arr;
	}

	hasValue(str: string | null | undefined): boolean {
		return (str && str !== '') || false;
	}

	setFillScriptForFocus(
		filledFields: { [id: string]: AutofillField },
		fillScript: AutofillScript
	): AutofillScript {
		let lastField: AutofillField | null = null;
		let lastPasswordField: AutofillField | null = null;

		for (const opid in filledFields) {
			// eslint-disable-next-line
			if (filledFields.hasOwnProperty(opid) && filledFields[opid].viewable) {
				lastField = filledFields[opid];

				if (filledFields[opid].type === 'password') {
					lastPasswordField = filledFields[opid];
				}
			}
		}

		// Prioritize password field over others.
		if (lastPasswordField) {
			fillScript.script.push(['focus_by_opid', lastPasswordField.opid]);
		} else if (lastField) {
			fillScript.script.push(['focus_by_opid', lastField.opid]);
		}

		return fillScript;
	}
}
