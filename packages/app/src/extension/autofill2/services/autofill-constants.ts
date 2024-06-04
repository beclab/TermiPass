export class AutoFillConstants {
	static readonly UsernameFieldNames: string[] = [
		// English
		'username',
		'user name',
		'email',
		'email address',
		'e-mail',
		'e-mail address',
		'userid',
		'user id',
		'customer id',
		'login id',
		'login',
		// German
		'benutzername',
		'benutzer name',
		'email adresse',
		'e-mail adresse',
		'benutzerid',
		'benutzer id'
	];

	static readonly TotpFieldNames: string[] = [
		'totp',
		'2fa',
		'mfa',
		'totpcode',
		'2facode',
		'approvals_code',
		'code',
		'mfacode',
		'otc',
		'otc-code',
		'otp-code',
		'otpcode',
		'pin',
		'security_code',
		'twofactor',
		'twofa',
		'twofactorcode',
		'verificationCode'
	];

	static readonly SearchFieldNames: string[] = [
		'search',
		'query',
		'find',
		'go'
	];

	static readonly FieldIgnoreList: string[] = [
		'captcha',
		'findanything',
		'forgot'
	];

	static readonly PasswordFieldExcludeList: string[] = [
		...AutoFillConstants.FieldIgnoreList,
		'onetimepassword'
	];

	static readonly ExcludedAutofillLoginTypes: string[] = [
		'hidden',
		'file',
		'button',
		'image',
		'reset',
		'search'
	];

	static readonly ExcludedAutofillTypes: string[] = [
		'radio',
		'checkbox',
		...AutoFillConstants.ExcludedAutofillLoginTypes
	];

	static readonly ExcludedOverlayTypes: string[] = [
		'textarea',
		...AutoFillConstants.ExcludedAutofillTypes
	];
}
