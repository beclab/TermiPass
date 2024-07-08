export default {
	Vault: 'Vault',
	web: {
		tools: {
			title: 'Tools',
			export: 'Export',
			import: 'import'
		},
		security: {
			title: 'Security'
		},
		account: {
			title: 'Account'
		},
		display: {
			title: 'Display'
		},
		rebinding: {
			title: 'Rebinding'
		}
	},
	failed_to_unlock_too_many_times:
		'Failed to unlock too many times. You will have to login again.',
	master_password: 'Master Password',
	change_master_password: 'Change Master Password',
	multi_factor_authentication: 'Multi-Factor Authentication',
	add_mfa_method: 'Add MFA Method',
	active_sessions: 'Active Sessions',
	macos_device: 'MacOS Device',
	current_device: 'Current Device',
	not_supported: 'Not Supported',
	trusted_devices: 'Trusted Devices',
	security_report: 'Security Report',
	weak_passwords: 'Weak Passwords',
	reused_passwords: 'Reused Passwords',
	compromised_passwords: 'Compromised Passwords',
	expiring_or_expired_items: 'Expiring or Expired Items',
	unknown_device: 'Unknown Device',
	weak_password_info:
		"Passwords are considered weak if they're\
  too short, don't have a lot of variation\
  or contain commonly used words or\
  phrases. These passwords generally don't\
  offer enough protection against\
  automated guessing attempts and should\
  be replaced with strong, randomly\
  generated passwords.",
	nothing_found: 'Nothing Found',
	reused_passwords_info:
		'Using the same password in multiple\
  places is strongly discouraged as a data\
  leak in one of those places will\
  automatically compromise all other\
  accounts/logins using the same password.\
  We recommend generating strong, random\
  and unique passwords for every single\
  vault item.',
	compromised_passwords_info:
		'Compromised passwords are those that\
  have been identified as having been\
  leaked in the past by comparing them\
  against a database of known data\
  breaches. These passwords can no longer\
  be considered secure and should be\
  changed immediately.',
	no_vault_selected: 'No vault selected',
	no_more_members_available: 'No more Members available',
	no_members_have_been_given_access_to_this_vault_yet:
		'No Members have been given access to this vault yet.',
	delete_vault: 'Delete Vault',
	delete_vault_message:
		'Are you sure you want to delete this vault? All the data stored in it will be lost! This action can not be undone.',
	type_delete_to_confirm: 'Type "DELETE" to confirm',
	please_re_enter: 'Please re-enter',
	delete_vault_success: 'Delete vault success',
	vault_name_is_null: 'Vault name is null',
	having_the_same_vault_name: 'Having the same Vault name.',
	create_vault_success: 'Create vault success',
	update_vault_access_success: 'Update vault access success',
	add_vault: 'Add Vault',
	not_have_any_vaults_yet: "Don't have any vaults yet.",
	not_have_any_members_yet: "Don't have any members yet.",
	//2.29
	rotate_cryptographic_keys: 'Rotate Cryptographic Keys',
	change_organization_name: 'Change Organization Name',
	rotate_cryptographic_key_message:
		"Do you want to rotate this organization's cryptographic keys? All organization memberships will have to be reconfirmed but no data will be lost.",
	rotate_cryptographic_key_notify_success:
		"The organization's cryptographic keys have been rotated successfully and membership confirmation requests for all members have been sent out.",
	something_went_wrong_please_try_again_later:
		'Something went wrong. Please try again later!',
	rename_organization: 'Rename Organization',
	please_enter_a_name: 'Please enter a name!',

	make_admin: 'Make Admin',
	remove_admin: 'Remove Admin',
	make_owner: 'Make Owner',
	vaults: 'Vaults',
	no_more_vaults_available: 'No more Vaults available',
	this_member_does_not_have_access_to_any_vaults_yet:
		'This member does not have access to any vaults yet.',
	no_member_selected: 'No member selected.',
	something_went_wrong_request_try_again_later:
		'Something went wrong while processing your request. Please try again later!',
	remove_member: 'Remove Member',
	remove_member_message:
		'Are you sure you want to remove this member from this organization?',
	invitation_status_has_been_restored: 'Invitation status has been restored.',
	make_admin_message:
		'Are you sure you want to make this member an admin? Admins can manage vaults, groups and permissions.',
	make_owner_message:
		"Are you sure you want to transfer this organization's ownership to {member}?",
	the_organization_ownership_was_transferred_successfully:
		'The organization ownership was transferred successfully!',
	remove_admin_message: 'Are you sure you want to remove this member as admin?',
	suspended_member: 'Suspended Member',
	suspended_member_message: 'Are you sure you want to suspend this member?',
	please_enter_at_least_one_did: 'Please enter at least one DID!',
	invite_new_members: 'Invite New Members',
	invite_new_members_message:
		'Please enter up to 50 DID of the persons you would like to invite, separated by spaces or commas!',
	invite: 'Invite',
	a_membership_confirmation_request_was_send_to:
		'A membership confirmation request was send to:',
	an_invite_was_send_to: 'An invite was sent to:',
	following_confirmation_code_shuould_communicate_to_them_separately:
		'They will also need the following confirmation code, which you should communicate to them separately:',
	add_member: 'Add Member',
	no_invite_selected: 'No invite selected.',
	this_invite_has_expired: 'This invite has expired',
	expires_date_0: 'expires {date_0}',
	membe_was_successfully_added_to_your_organization:
		'{member} was successfully added to your organization!',
	do_not_have_any_invitees_yet: "Don't have any invitees yet.",
	expired: 'Expired',
	delete_invite: 'Delete Invite',
	are_you_sure_you_want_to_delete_this_invite:
		'Are you sure you want to delete this invite?',
	delete_invite_success: 'Delete invite success',
	dashboard: 'Dashboard',
	new_vault: 'New Vault',
	invites: 'Invites',
	no_data: 'No Data.',
	provisioned: 'Provisioned',
	isSuspended: 'isSuspended',
	this_organization_does_not_have_any_vaults_yet:
		'This organization does not have any vaults yet.',
	please_enter_your_current_password: 'Please enter your current password!',
	enter_current_password: 'Enter Current Password',
	please_unlock_first: 'Please unlock first',
	now_choose_a_new_master_password: 'Now choose a new master password!',
	enter_New_password: 'Enter New Password',
	wrong_password_please_try_again: 'Wrong password! Please try again!',
	please_confirm_your_new_password: 'Please confirm your new password!',
	repert_new_password: 'Repeat New Password',
	vault_t: {
		upload_attachment: 'Upload Attachment',
		attachment_name: 'Attachment Name',
		uploading_loaded_total: 'uploading... {loaded}/{total}',
		uploading_loaded: 'uploading...',
		unkown_file_type: 'Unknown File Type',
		discard: 'Discard',
		upload: 'Upload',
		storage_limit_exceeded: 'Storage limit exceeded!',
		upload_failed_please_try_again: 'Upload failed! Please try again!',
		no_preview_available: 'No preview available.',
		download_failed: 'Download failed!',
		need_to_download_attachment_first: 'Need to download attachment first!',
		save_to_disk: 'Save To Disk',
		save_to_disk_message:
			'Do you want to save this file to your disk? WARNING: Doing this will leave the file exposed and unprotected on your hard drive!',
		delete_attachment: 'Delete Attachment',
		delete_attachment_message:
			'Are you sure you want to delete this attachment?',
		can_not_move_item_message: 'Items with attachments cannot be moved!',
		move_item: 'Move Item',
		restore_version_message:
			'Are you sure you want to restore your item to this version?',
		restore_version: 'Restore Version',
		upload_complete: 'Upload Complete',
		upload_complete_successfully: 'File uploaded successfully!',
		the_selected_file_is_too_large_only_files_of_up_to_1t_are_supported:
			'The selected file is too large! Only files of up to 1T are supported.',
		remove_field: 'Remove Field',
		remove_field_message: 'Are you sure you want to remove this field?',
		one_time_password_is_required: 'One-Time Password is required',
		item_name_is_null: 'Item name is null',
		current_version: 'Current Version',
		remove_expiratio: 'Remove Expiration',
		days_after_being_updated: 'days after being updated',
		add_expiration: 'Add Expiration',
		click_or_drag_files_here_to_add_an_attachment:
			'Click or drag files here to add an attachment!',
		add_field: 'Add Field',
		delete_item: 'Delete Item',
		move_to_vault: 'Move To Vault...',
		enter_item_name: 'Enter Item Name',
		add_tags_placeholder: 'Add Tags...',
		no_item_selected: 'No item selected.',
		are_you_sure_you_want_to_leave_this_page_any_changes_will_be_lost:
			'Are you sure you want to leave this page? Any changes will be lost.',
		some_items_not_have_white_access_message:
			"Some items in your selection are from Vaults you don't have write access to and cannot be moved. Do you want to proceed moving the other items?",
		my_vault: 'My Vault',
		recently_used: 'Recently Used',
		all_vaults: 'All Vaults',
		you_don_not_have_any_items_yet: "You don't have any items yet.",
		you_don_not_have_any_recently_used_items:
			"You don't have any recently used items!",
		you_don_not_have_any_favorites_yet: "You don't have any favorites yet.",
		you_don_not_have_any_attachments_yet: "You don't have any attachments yet.",
		this_vault_don_not_have_any_items_yet:
			'This vault does not have any items yet.',
		no_matching_vault: 'There is no matching Vault',
		your_seach_did_not_match_any_items: 'Your search did not match any items.',
		new_vault_item: 'New Vault Item',
		this_item_has_no_fields: 'This item has no fields.',
		no_fields: 'No fields',
		count_items_selected: '{count} items selected',
		are_you_sure_you_want_to_dismiss_this_invite:
			'Are you sure you want to dismiss this invite',
		dismiss_invite: 'Dismiss Invite',
		wrong_confirmation_code_please_try_again:
			'Wrong confirmation code. Please try again!',
		successfully_accepted_the_invite_notify_info:
			"You have successfully accepted the invite. You'll be notified once you've been granted access.",
		please_enter_the_confirmation_code_provided_to_you_by_the_organization_owner:
			'Please enter the confirmation code provided to you by the organization owner!',
		you_have_already_accepted_this_invite:
			'You have already accepted this invite!',
		invitor_invited_to_join: '{inviter} invited to join',
		invitor_requested_to_confirm_your_membership_with:
			'requested to confirm your membership with:',
		move_item_to: 'Move Item To',
		move_leng_items_selected_to: "Move'{length} items selected' to",
		can_signing: 'Can Signing',
		show_in_sign_server: 'Show in Sign Server',
		this_is_a_meeage: 'This is a message',
		typically_64_alphanumeric_characters:
			'Typically 64 alphanumeric characters',
		what_kind_of_item_you_would_like_to_add:
			'What kind of item you would like to add?',
		select_vault: 'Select Vault'
	},
	auto_lock: 'Auto Lock',
	lock_automatically: 'Lock Automatically',
	terminus_authenticator: 'Terminus Authenticator',
	are_you_sure_to_delete:
		'Are you sure you want to delete these items? This action can not be undone!',

	last_sync_time: 'Last Sync {time}',
	copy_failure_message: 'Copy failure {message}',
	confirmation_code: 'Confirmation Code',
	subaccount: 'Sub Account',
	new_exchange: 'New Exchange',
	wallet_name: 'Wallet name',
	crypto_wallet: 'Crypto Wallet',

	expired_items: 'Expired Items',
	expired_items_info:
		"Expired items are those that have been\
  identified as being past their set\
  expiry date, which haven't been updated\
  in a given number of days. These items\
  should be rotated as soon as possible.",
	password_generators: 'Password Generators',

	random_string: 'random string'
};
