type AddLoginMessageData = {
	username: string;
	password: string;
	url: string;
};

type ChangePasswordMessageData = {
	currentPassword: string;
	newPassword: string;
	url: string;
};

const NotificationQueueMessageType = {
	AddLogin: 'add',
	ChangePassword: 'change',
	UnlockVault: 'unlock',
	RequestFilelessImport: 'fileless-import'
} as const;

type NotificationQueueMessageTypes =
	(typeof NotificationQueueMessageType)[keyof typeof NotificationQueueMessageType];

const NOTIFICATION_BAR_LIFESPAN_MS = 150000;

export {
	AddLoginMessageData,
	ChangePasswordMessageData,
	NotificationQueueMessageType,
	NotificationQueueMessageTypes,
	NOTIFICATION_BAR_LIFESPAN_MS
};
