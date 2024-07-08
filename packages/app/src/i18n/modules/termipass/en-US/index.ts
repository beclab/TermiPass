export default {
	unlock: {
		title: 'Unlock',
		vault_unlock_introduce:
			'You are accessing Vault private data. To ensure the security of your account, please enter the local unlock password to verify your identity.',
		auth_popup_unlock_introduce:
			'You are using TermiPass signature authorization service. To ensure the security of your account, please enter the local unlock password to verify your identity.',
		one_time_unlock_introduce:
			'You are viewing the one-time password of Terminus two-factor authentication. To ensure the security of your account, please enter the local unlock password to verify your identity.',
		unauth_lock_reminder:
			'After successful unlocking, you do not need to unlock again when using this service during the app running time.',
		auth_lock_reminder:
			'After successful unlocking, you do not need to unlock again when using this service within {time}.'
	},
	autolock: {
		title: 'Auto-lock',
		reminderTitle:
			'The lock screen service will be applied in the following scenarios',
		reminder1: 'Use the relevant functions in the Vault tab',
		reminder2: 'View One-Time Passwords for Terminus Two-Factor Authentication',
		reminder3: 'Use the TermiPass authorized signing service'
	},
	terminus_name_not_created: 'No Terminus Name Bound',

	photo_album: 'Photo Album',
	scan_the_qr_code: 'Scan the QR code',
	scan_qr_code: 'Scan QR Code',
	scan_qr_code_to_activate: 'Scan the QR code to activate',
	read_fail_try_again: 'read content fail, please try again',
	qr_code_error: 'The qr code content is error,please retry scan',
	please_choose_user: 'Please choose user',
	set_up_later: 'Set up later',
	biometry_is_not_available: 'Biometry is not available',
	for_easy_login: 'For easy login',
	face_id_verification: 'Face ID Verification',
	touch_id_verification: 'Touch ID Verification',
	fingerprint_verification: 'Fingerprint Verification',
	scan_your_fingerprint_to_verify_your_identity:
		'Scan your fingerprint to verify your identity',
	face_authentication: 'Face Authentication',
	scan_your_face_to_verify_your_identity:
		'Scan your face to verify your identity',
	iris_authentication: 'Iris Authentication',
	scan_your_iris_to_verify_your_identity:
		'Scan your iris to verify your identity',
	authentication: 'Authentication',
	scan_your_authentication_to_verify_your_identity:
		'Scan your authentication to verify your identity',
	scan_to_verify_your_identity: 'Scan to verify your identity',
	set_up: 'Set up',
	scan_my: 'Scan My',
	set_up_face_id: 'Set up Face ID',
	scan_my_face: 'Scan My Face',
	set_up_touch_id: 'Set up Touch ID',
	scan_my_fingerprint: 'Scan My Fingerprint',
	set_up_fingerprint: 'Set up Fingerprint',
	set_up_face_authentication: 'Set up Face Authentication',
	set_up_iris_authentication: 'Set up Iris Authentication',
	scan_my_iris: 'Scan My Iris',
	set_up_authentication: 'Set up Authentication',
	scan_my_authentication: 'Scan My Authentication',

	//bind vc
	bind_vc: 'Bind VC',
	not_connected_terminus_log_in_now:
		'Not connected to your Terminus yet, please log in now',
	autofill: 'Autofill',
	password_autofill: 'Password Autofill',
	autofill_service: 'Autofill Service',
	autofill_service_desc:
		'The Autofill Service uses the Android Autofill Framework to assist in filling login information into other apps on your device',
	use_accessibility: 'Use Accessibility',
	use_accessibility_desc:
		'Required to use the Autofill Quick-Action Tile, or to augment the Autofill Service by using Draw-Over(if turned On)',
	use_draw_over: 'Use Draw-Over',
	use_draw_over_desc:
		"If turned on, accessibility will show a popup to augment the Autofill Service for older apps that don't support the Android Autofill framework",
	get_instant_access_to_your_passwords: 'Get instant access to your passwords!',
	autofill_instructions:
		'To set up password autofill on your device, follow these instructions:',
	go_to_the_ios_settings: 'Go to the iOS "Settings" app',
	tap_passwords: 'Tap "Passwords"',
	tap_autofill_passwords: 'Tap "Autofill Passwords"',
	turn_on_autoFill: 'Turn on AutoFill',
	select_termiPass: 'Select "TermiPass"',
	accessibility_service_disclosure: 'Accessibility Service Disclosure',
	accessibility_service_disclosure_desc:
		'TermiPass uses the Accessibility Service to search for login fields in apps and websites, then establishes the appropriate field IDs for entering a username and password when a match for the app or site is found. We do not store any of the information presented to us by the service,nor do we make any attempt to control any on-screen elements beyond text entry of credentials.',
	open_accessibility_first: 'open accessibility first',

	website_manager: 'Website Manager',
	website_manager_desc:
		'Allow the following websites to access TermiPass, click on the website to disconnect',
	disconnect_warning: 'disconnect warning',
	disconnect_warning_content:
		'Are you sure you want to disconnect from the website?',
	enable_extension_badge: 'Enable Extension Badge',
	enable_approval_badge: 'Enable Approval Badge',
	enable_autofill_badge: 'Enable Autofill Badge',
	enable_rss_badge: 'Enable Rss Badge',

	create_terminus_name_info:
		"You now have a DID.<br><br>\
1. DID resolves the issue of decentralized identity but is difficult to remember and recognize. Terminus Name can solve this problem.<br><br>\
2. You can think of an Individual Terminus Name as your personal email address. <br><br>\
3. The application process is divided into two steps: issuing Verifiable Credential and submitting Verifiable Presentation. The results are recorded in the blockchain smart contract, ensuring global uniqueness.<br><br>\
4. The entire process is free of charge. We will cover the blockchain mining fees on your behalf.',",

	please_select_vc_desc:
		'If this is your first time using Terminus, please select the Individual type for your Terminus Name, which requires you to provide a Gmail address. If you have read the documentation and are sure you want to create or join an organization, select Organization.',
	about_organzation_terminus_name: 'Organization Terminus Name',
	create_organzation_terminus_name_info:
		"If you would like to join an organization, please ensure that the organization's administrator has informed you of the email to use when verifying the organization's Terminus Name.<br><br>\
If you want to create an organization, please refer to the steps listed in the Terminus documentation.",
	bind_personal_vc: 'Individual Terminus Name',
	bind_organization_vc: 'Organization Terminus Name',
	choose_to_join_existing_org:
		'Please choose whether to join an existing organization or to create a new one.',
	join_an_existing_organization: 'Join an existing organization',
	create_a_new_organization: 'Create a new organization',
	bind_a_terminus_space_to_continue:
		'You must log in and bind a Terminus Space account to continue.',
	terminus_space_account: 'Terminus Space account',
	after_verification_code_bind_terminus:
		'After entering the verification code, complete the binding of the Terminus Space account and the current did.',
	domain_list_under_account_desc:
		'Please refer to the Terminus documentation to complete the domain binding. If the domain you are applying for is not included in the provided list, refer to the documentation to add it in Terminus Space.',
	confirm_bind_domain_name_desc:
		'To confirm the binding of this domain, please click the button below to continue.',
	confirm_bind_domain_bingding_desc:
		"Please set up your organization's email binding rules. Please note: We only support gmail and Google Workspace emails. You can add and manage more email suffixes and member email addresses on Terminus Cloud later.",
	confirm_bind_domain_text_record_desc:
		'Please add the following TXT information to verify ownership',
	confirm_bind_domain_cname_record_desc:
		'Please add the following NS (Name Server) information to {domain}',
	confirm_bind_domain_common_desc:
		'Confirm that you want to bind this domain name, please click the button to continue.',
	enter_domain_name_organization_want_to_join:
		'Please enter the domain of the organization you wish to join, for example:',
	bind_organization_vc_last_step_desc:
		"Please enter the email address to be verified. If you are unsure, contact the organization's administrator or refer to the documentation.",
	bind_organization_vc_last_step_desc_more_note:
		'Please note that we currently only support Gmail or Google Workspace email addresses.',

	congratulations_on_successfully_owning_a_terminus_name:
		'Congratulations on acquiring a Terminus Name',
	complete_your_terminus_device_activation:
		'Please scan the QR code on the Wizard page to begin activation.',
	network_configuration: 'Network Configuration',
	network_configuration_introduce:
		'We are in the process of applying for an HTTPS certificate and configuring it',
	https_certificate_issuance_failed: 'Configuration Failed',
	https_certificate_issuance_failed_please_try_again:
		'Configuration failed, please try again',
	dns_resolution: 'DNS Resolution',
	dns_resolution_introduce:
		'Waiting for DNS resolution to take effect. When the DNS takes effect, you will be able to visit your Terminus<br>',
	dns_resolution_failed: 'DNS Resolution Failed',
	dns_resolution_failed_please_try_again:
		'DNS resolution failed, please try again',
	initialize_terminus_system: 'Initialize Terminus',
	reset_your_Terminus_device_password: 'Reset your Terminus password',
	please_wait_a_monent_checking_the_status_of_the_terminus:
		'Checking the status of your Terminus, please wait.',
	specified_email_address_reminder:
		'Please use Gmail or Google Workspace email to register your organization account.',

	vpn: {
		off: {
			description: 'VPN is disconnected'
		},
		on: {
			description: 'VPN is enabled'
		},
		invalid: {
			description: 'Unable to connect to Terminus'
		},
		connecting: {
			description: 'Attempting a VPN Connection'
		}
	},
	user_current_status: {
		offline_mode: {
			title: 'Offline Mode',
			disabled: 'Offline Mode is disabled',
			enabled: 'Offline Mode is enabled',
			enable: 'Enable offline mode'
		},
		networkOnLine: {
			title: 'Offline',
			description: 'Network abnormality, please check local network settings',
			message: 'Network abnormality, please check local network settings'
		},
		reactivation: {
			title: 'Needs reactivate',
			description: 'Need to reactivate Terminus. Learn more',
			description_ex: 'Learn more',
			mobile_message:
				'There is a problem with your connection to your Terminus. \
      This problem may be caused by a temporary network connection problem in Terminus. \
      This problem will disappear automatically after Terminus returns to normal. \
      But it may also be because your Terminus has been destroyed and needs to be reactivated. \
      If you confirm that reactivation is required, select Reactivate. \
      If you cannot confirm the situation, please ignore this message or contact your administrator for help. \
      If you feel disturbed by the status bar, you can enable Offline Mode.',
			message:
				'There is a problem with your connection to your Terminus. \
      This problem may be caused by a temporary network connection problem in Terminus.\
      This problem will disappear automatically after Terminus returns to normal.\
      But it may also be because your Terminus has been destroyed and needs to be reactivated.\
      If you confirm that reactivation is required, please use the TermiPass mobile client to do so.\
      If you cannot confirm the situation, please ignore this message or contact your administrator for help.\
      If you feel disturbed by the status bar, you can enable Offline Mode.'
		},
		token_invalid: {
			title: 'Needs login',
			description: 'Need to log in to Terminus again',
			description_ex: 'log in',
			message:
				"You need to enter your Terminus login password so that TermiPass can log in to Terminus. Don't worry, your local data will not be lost."
		},
		srp_invalid: {
			title: 'Needs reconnect',
			description: 'Need to reconnect to Terminus',
			description_ex: 'reconnect',
			message:
				"You need to enter your Terminus login password so that TermiPass can connect to Terminus. Don't worry, your local data will not be lost."
		},
		requires_vpn: {
			title: 'Needs open VPN',
			description: 'Need VPN to connect to Terminus',
			description_ex: 'connect',
			dialog_title: 'Need Vpn to connect to Terminus',
			message: 'Open VPN now?'
		},
		connecting: {
			title: 'Connecting'
		},
		vpn: {
			title: 'VPN'
		},
		intranet: {
			title: 'Intranet'
		},
		internet: {
			title: 'Internet'
		},
		p2p: {
			title: 'P2P'
		},
		derp: {
			title: 'DERP'
		}
	},
	transmission: {
		title: 'Transmission',
		download: {
			title: 'Download',
			start_notify: '{fileName} download starts',
			completed_notify: '{fileName} download completed'
		},
		complete: {
			title: 'Complete'
		},
		all_clear: 'All clear',
		all_Start: 'All start',
		pause_all: 'Pause all'
	},
	monitor: {
		cpu: {
			title: 'cpu'
		},
		memory: {
			title: 'memory'
		},
		disk: {
			title: 'disk'
		}
	},
	ios: {
		allow_cross_website_message:
			'In order to display multimedia files such as images normally,\
    we need you to turn on the "Allow cross-site tracking" function.\
    The application will restart after the setup is complete. \
    After that, make sure this feature is turned on.'
	},
	go_to_open: 'Go to open',
	enable_badges: 'Enable badges',
	mnemonics_no_match: 'Mnemonic Phrase no match',
	please_clarify_the_information: 'Please note the following information:',
	without_the_mnemonic_there_is_no_terminusName:
		'Losing the mnemonic phrase will result in the loss of your DID and Terminus Name.',
	without_terminusName_there_is_no_data_for_you:
		'Losing the mnemonic phrase will result in the loss of data in the vault.',
	copy_mnemonics: 'Copy Mnemonic Phrase',
	backup_mnemonics_reminder_info:
		'Please view your mnemonic phrase when alone.\
		We recommend writing it down on paper and storing it in a secure location.',
	click_to_view: 'Click to view',
	please_select_each_word_in_the_order_presented_previously:
		'Please arrange the 12 words in the order displayed on the previous page.',
	reactivation: 'Reactivation',
	view_your_mnemonic_phrase: 'Manage your mnemonic phrase',
	please_backup_your_mnemonic_phrase: 'Please back up your mnemonic phrase',
	back_up_your_mnemonic_phrase_immediately_to_safe:
		'Back up your mnemonic phrase immediately to ensure the security of your account and data',
	start_backup: 'Backup Now',
	bind_your_social_account: 'Manage your VC cards',
	selected_vc_sign_vp: 'selected VC sign VP',
	not_support_bind: 'not support bind',
	bind_success: 'Bind success',
	add_feed_success: 'Add feed success',
	add_feed_fail: 'Add feed fail',
	add_page_success: 'Add page success',
	add_page_fail: 'Add page fail',
	the_current_domain_name_is_unavailable_please_contact_the_administrator_to_obtain_a_valid_domain_name:
		'The current domain name is unavailable, please contact the administrator to obtain a valid domain name',
	code_message_info: 'Code: {code}, message: {message}',
	bex_import_mnemonics_not_active_reminder:
		'The corresponding DID for this mnemonic phrase does not have a corresponding Terminus Name, so it cannot be imported. Please try importing it using a mobile device and apply for a Terminus Name according to the prompts',
	the_current_status_this_module_cannot_be_accessed:
		'The current status is {status} and this module cannot be accessed',
	domain_list: 'Domain List',
	refresh: 'refresh',
	select_binding_rules: 'Select binding rules',
	fixed_email_suffix: 'Fixed Email_Suffix',
	please_enter_your_organization_email_suffix_enter_multiple_separated_by_commas:
		"Please enter your organization's email suffix, Enter multiple, separated by commas.",
	integration: {
		title: 'Integration',
		add_account: 'Add Account',
		account_settings: 'Account Settings',
		mount_network_drive: 'Mount Network Drive',
		access_key_id: 'AccessKey ID',
		access_key_secret: 'AccessKey Secret',
		endpoint: 'Endpoint',
		bucket: 'Bucket',
		optional: 'Optional',
		aws_create_success_reminder:
			'Congratulations, you have successfully mounted the object storage service!',
		object_storage: 'Object Storage'
	},
	login_terminus_space: 'Login Terminus Space',
	login_terminus_space_desc:
		'Your {did} is being used to log in to Terminus Space. Please confirm whether it is done by you. Click Confirm to authorize the action, or Cancel to deny the action.',
	download_location: 'Download location',
	computer_does_not_sleep_when_there_is_a_task:
		'Computer does not sleep when there is a task',
	check_password: 'Need Password',
	delete_account_message: 'Are you sure to delete the account?',
	mnemonic_backup: 'Mnemonic Phrase Backup',
	sign_success: 'Sign Success',
	user_management_center: 'User management center',
	encrypted_connection: 'VPN connection',
	reactivate: 'Reactivate',
	pending: 'Pending',
	to_secure_your_account_please_complete_the_following_verification:
		'To secure your account, please complete the following verification.',
	settings: {
		changePassword: 'Change Password',
		authenticator: 'Authenticator',
		equipment_usage: 'Terminus',
		settings: 'Settings',
		safety: 'Safety',
		account_administration: 'Account administration',
		account_root_message:
			'To set account avatar, mnemonic phrase, VC verification and other functions, please visit',
		autostart_settings: 'Autostart settings'
	},
	change_local_password: 'Change the local TermiPass password',
	please_enter_the_old_password: 'Please enter the old password',
	backup_mnemonic_phrase: 'Backup mnemonic Phrase',
	security_verification: 'Security Verification',
	enter_one_time_password:
		'Please enter the TermiPass 6-digit one-time password.',
	add_vc: 'Add VC',
	switch_accounts: 'Switch Account',
	logged_in: 'Logged in',
	request_user: 'request user',
	add_new_terminus_name: 'Add a new account',
	no_information: 'No information',
	domain: {
		wait_txt_resolve_desc: 'Awaiting TXT record configuration',
		wait_ns_resolve_desc: 'Awaiting NS record configuration',
		wait_request_vc_desc:
			"Awaiting the application for the domain's Verifiable Credential ",
		wait_submit_vp_desc:
			"Awaiting submission of the domain's Verifiable Presentation",
		wait_rule_set_desc: 'Awaiting rule configuration',
		bind_desc: 'Completed',
		allocated_desc: 'Allocated',
		title: 'Domain'
	},
	verify_using_gmail: 'Verify using Gmail',
	download_failed: 'Download Failed',
	rename_file: 'Rename File',
	pdf_name: 'PDF name',
	input_pdf_name: 'Input PDF name',
	select_folder: 'Select folder',
	reconnect: 'Reconnect',
	vpn_peers: 'VPN peers',
	reconnect_terminus: 'Reconnect Terminus',
	reconnect_terminus_message: 'Vault need Reconnect Terminus',
	export_mnemonic_phrase: 'Export Mnemonic Phrase',
	set_as_default_download_location: 'Set as default download location',

	'We will use a VPN to help users connect to Terminus':
		'We will use a VPN to help users connect to Terminus',
	'TermiPass employ VPN services to ensure the privacy and security of our users. The VPN service is responsible for connecting your device terminal to the network where the Terminus server is located so that you can access Terminus server resources. The service will not access, hijack, tamper with your content information.':
		'TermiPass employ VPN services to ensure the privacy and security of our users. The VPN service is responsible for connecting your device terminal to the network where the Terminus server is located so that you can access Terminus server resources. The service will not access, hijack, tamper with your content information.',
	'Get Started': 'Get Started',
	'System state at a glance': 'System state at a glance',
	'Encrypted connection safe and solid': 'Encrypted connection safe and solid',
	'Password management end-to-end encryption':
		'Password management end-to-end encryption',
	'File management take data with you': 'File management take data with you',
	'Welcome to TermiPass': 'Welcome to TermiPass',
	"This is your must-have app for connecting to Terminus. Now let's create a new world together.":
		"This is your must-have app for connecting to Terminus. Now let's create a new world together.",
	'Let us own our data again!': 'Let us own our data again!',
	'Create an account': 'Create an account',
	'Import an account': 'Import an account',
	'To address fairness in distribution and potential security issues, we need to verify your social media accounts. Your Terminus Name will be aligned with the social accounts you submit.':
		'To address fairness in distribution and potential security issues, we need to verify your social media accounts. Your Terminus Name will be aligned with the social accounts you submit.',
	'Please enter the 12-word mnemonic phrase to import your Terminus Name.':
		'Please enter the 12-word mnemonic phrase to import your Terminus Name.',
	'Please enter the password to unlock TermiPass.':
		'Please enter the password to unlock TermiPass.',
	'Please enter the password to unlock Vault.':
		'Please enter the password to unlock Vault.',
	'Set up a password': 'Set up a password',
	'This password is only used for unlocking {AppName} on this device':
		'This password is only used for unlocking {AppName} on this device',
	'Password settings': 'Password settings',
	'Length 8-32 characters': 'Length 8-32 characters',
	'Contains lowercase letters': 'Contains lowercase letters',
	'Contains uppercase letters': 'Contains uppercase letters',
	'Contains numbers': 'Contains numbers',
	'Contains symbols': 'Contains symbols',
	password_not_empty: 'Password can not be empty',
	password_not_meet_rules: 'Password does not meet the rules',
	password_not_match: '· The passwords entered do not match',

	biometric_unlock: 'Biometric Unlock',
	biometric_unlock_desc:
		'Set up fingerprint unlock for a safer and faster way to unlock TermiPass.',
	biometric: {
		error: {
			biometric_is_not_available: 'Biometric is not available'
		}
	},
	password_empty: 'Password is empty',
	password_error: 'Password is error',
	not_backed_up: 'Not backed up yet',
	use_biometrics: 'Biometric Unlock',
	please_use_a_gmail_email_address: 'Please use a "{gmail}" email address.',
	languages: {
		he: 'עברית',
		ar: 'العربية',
		de: 'Deutsch',
		en: 'English',
		es: 'Español',
		fr: 'Français',
		is: 'Icelandic',
		it: 'Italiano',
		ja: '日本語',
		ko: '한국어',
		nlBE: 'Dutch (Belgium)',
		pl: 'Polski',
		pt: 'Português',
		ptBR: 'Português (Brasil)',
		ro: 'Romanian',
		ru: 'Русский',
		sk: 'Slovenčina',
		svSE: 'Swedish (Sweden)',
		tr: 'Türkçe',
		ua: 'Українська',
		zhCN: '中文 (简体)',
		zhTW: '中文 (繁體)'
	},
	submit_vc_info: 'Submit VC Info',
	requesting_connection: 'Requesting Connection',
	requesting_call_termiPass: 'Requesting Call TermiPass',
	current_version: 'Current Version',
	about_creating_terminusName: 'Terminus Name Tips',
	in_offline_mode: 'Offline Mode',
	terminus_space_management: 'Terminus Space',
	domain_management_etc: 'Manage your Terminus Space',
	there_is_nothing_for_now: 'There is nothing for now',
	vc_management: 'VC Cards',
	view_details: 'View Details'
};
