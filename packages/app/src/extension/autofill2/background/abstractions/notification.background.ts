import { Runtime, Tabs } from 'webextension-polyfill-ts';
import AutofillPageDetails from '../../models/autofill-page-details';
import { NeverDomains } from '../../services/abstractions/autofill.service';
import {
	AddLoginMessageData,
	ChangePasswordMessageData,
	NotificationQueueMessageTypes
} from '../../utils/notification';

interface NotificationQueueMessage {
	type: NotificationQueueMessageTypes;
	domain: string;
	tab: Tabs.Tab;
	expires: Date;
	wasVaultLocked: boolean;
}

interface AddChangePasswordQueueMessage extends NotificationQueueMessage {
	type: 'change';
	cipherId: string;
	newPassword: string;
}

interface AddLoginQueueMessage extends NotificationQueueMessage {
	type: 'add';
	username: string;
	password: string;
	uri: string;
}

interface AddUnlockVaultQueueMessage extends NotificationQueueMessage {
	type: 'unlock';
}

interface AddRequestFilelessImportQueueMessage
	extends NotificationQueueMessage {
	type: 'fileless-import';
	importType?: string;
}

type NotificationQueueMessageItem =
	| AddLoginQueueMessage
	| AddChangePasswordQueueMessage
	| AddUnlockVaultQueueMessage
	| AddRequestFilelessImportQueueMessage;

type LockedVaultPendingNotificationsData = {
	commandToRetry: {
		message: {
			command: string;
			contextMenuOnClickData?: chrome.contextMenus.OnClickData;
			folder?: string;
			edit?: boolean;
		};
		sender: Runtime.MessageSender;
	};
	target: string;
};

type AdjustNotificationBarMessageData = {
	height: number;
};

type UnlockVaultMessageData = {
	skipNotification?: boolean;
};

type NotificationBackgroundExtensionMessage = {
	[key: string]: any;
	command: string;
	data?: Partial<LockedVaultPendingNotificationsData> &
		Partial<AdjustNotificationBarMessageData> &
		Partial<ChangePasswordMessageData> &
		Partial<UnlockVaultMessageData>;
	login?: AddLoginMessageData;
	folder?: string;
	edit?: boolean;
	details?: AutofillPageDetails;
	tab?: Tabs.Tab;
	sender?: string;
	notificationType?: string;
};

type SaveOrUpdateCipherResult = undefined | { error: string };

type BackgroundMessageParam = {
	message: NotificationBackgroundExtensionMessage;
};
type BackgroundSenderParam = { sender: Runtime.MessageSender };
type BackgroundOnMessageHandlerParams = BackgroundMessageParam &
	BackgroundSenderParam;

type NotificationBackgroundExtensionMessageHandlers = {
	[key: string]: CallableFunction;
	unlockCompleted: ({
		message,
		sender
	}: BackgroundOnMessageHandlerParams) => Promise<void>;
	// bgGetFolderData: ({
	// 	message,
	// 	sender
	// }: BackgroundOnMessageHandlerParams) => Promise<FolderView[]>;
	bgCloseNotificationBar: ({ sender }: BackgroundSenderParam) => Promise<void>;
	bgAdjustNotificationBar: ({
		message,
		sender
	}: BackgroundOnMessageHandlerParams) => Promise<void>;
	bgAddLogin: ({
		message,
		sender
	}: BackgroundOnMessageHandlerParams) => Promise<void>;
	// bgChangedPassword: ({
	// 	message,
	// 	sender
	// }: BackgroundOnMessageHandlerParams) => Promise<void>;
	bgRemoveTabFromNotificationQueue: ({ sender }: BackgroundSenderParam) => void;
	bgSaveCipher: ({ message, sender }: BackgroundOnMessageHandlerParams) => void;
	bgNeverSave: ({ sender }: BackgroundSenderParam) => Promise<void>;
	bgUnlockPopoutOpened: ({
		message,
		sender
	}: BackgroundOnMessageHandlerParams) => Promise<void>;
	// bgReopenUnlockPopout: ({ sender }: BackgroundSenderParam) => Promise<void>;
	checkNotificationQueue: ({ sender }: BackgroundSenderParam) => Promise<void>;
	collectPageDetailsResponse: ({
		message
	}: BackgroundMessageParam) => Promise<void>;
	bgGetEnableChangedPasswordPrompt: () => Promise<boolean>;
	bgGetEnableAddedLoginPrompt: () => Promise<boolean>;
	bgGetExcludedDomains: () => Promise<NeverDomains>;
	// bgGetActiveUserServerConfig: () => Promise<ServerConfig>;
	getWebVaultUrlForNotification: () => Promise<string>;
};

export {
	AddChangePasswordQueueMessage,
	AddLoginQueueMessage,
	AddUnlockVaultQueueMessage,
	AddRequestFilelessImportQueueMessage,
	NotificationQueueMessageItem,
	LockedVaultPendingNotificationsData,
	AdjustNotificationBarMessageData,
	UnlockVaultMessageData,
	SaveOrUpdateCipherResult,
	NotificationBackgroundExtensionMessage,
	NotificationBackgroundExtensionMessageHandlers
};
