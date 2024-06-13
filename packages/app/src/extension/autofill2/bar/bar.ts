import { AdjustNotificationBarMessageData } from '../background/abstractions/notification.background';

import {
	NotificationBarWindowMessageHandlers,
	NotificationBarWindowMessage,
	NotificationBarIframeInitData
} from './abstractions/notification-bar';

require('./bar.scss');

// const logService = new ConsoleLogService(false);
let notificationBarIframeInitData: NotificationBarIframeInitData = {};
let windowMessageOrigin: string;
const notificationBarWindowMessageHandlers: NotificationBarWindowMessageHandlers =
	{
		initNotificationBar: ({ message }) => initNotificationBar(message),
		saveCipherAttemptCompleted: ({ message }) =>
			handleSaveCipherAttemptCompletedMessage(message)
	};

globalThis.addEventListener('load', load);
function load() {
	setupWindowMessageListener();
	postMessageToParent({ command: 'initNotificationBar' });
}

function initNotificationBar(message: NotificationBarWindowMessage) {
	const { initData } = message;
	if (!initData) {
		return;
	}

	notificationBarIframeInitData = initData;
	const { isVaultLocked } = notificationBarIframeInitData;
	setNotificationBarTheme();

	(document.getElementById('logo') as HTMLImageElement).src = isVaultLocked
		? chrome.runtime.getURL('www/icons/termipass.png')
		: chrome.runtime.getURL('www/icons/termipass.png');
	setupLogoLink();
	const addTemplate = document.getElementById(
		'template-add'
	) as HTMLTemplateElement;

	const addButton = addTemplate.content.getElementById('add-save');
	if (addButton) {
		addButton.textContent = 'Save';
	}

	const addText = addTemplate.content.getElementById('add-text');
	if (addText) {
		addText.textContent = 'Should TermiPass remember this password for you?';
	}

	// i18n for body content
	const closeButton = document.getElementById('close-button');
	if (closeButton) {
		closeButton.title = 'Close';
	}

	if (initData.type === 'add') {
		handleTypeAdd();
	}

	if (closeButton) {
		closeButton.addEventListener('click', (e) => {
			e.preventDefault();
			sendPlatformMessage({
				type: 'bgCloseNotificationBar'
			});
		});
	}

	globalThis.addEventListener('resize', adjustHeight);
	adjustHeight();
}

function handleTypeAdd() {
	setContent(document.getElementById('template-add') as HTMLTemplateElement);

	const addButton = document.getElementById('add-save');
	addButton?.addEventListener('click', (e) => {
		e.preventDefault();

		// If Remove Individual Vault policy applies, "Add" opens the edit tab
		sendSaveCipherMessage(removeIndividualVault());
	});

	// if (removeIndividualVault()) {
	// 	// Everything past this point is only required if user has an individual vault
	// 	return;
	// }

	// const editButton = document.getElementById('add-edit');
	// editButton?.addEventListener('click', (e) => {
	// 	e.preventDefault();

	// 	sendSaveCipherMessage(true, getSelectedFolder());
	// });

	// const neverButton = document.getElementById('never-save');
	// neverButton?.addEventListener('click', (e) => {
	// 	e.preventDefault();
	// 	sendPlatformMessage({
	// 		command: 'bgNeverSave'
	// 	});
	// });

	// loadFolderSelector();
}

// function handleTypeChange() {
// 	setContent(document.getElementById('template-change') as HTMLTemplateElement);
// 	const changeButton = document.getElementById('change-save');
// 	changeButton.addEventListener('click', (e) => {
// 		e.preventDefault();

// 		sendSaveCipherMessage(false);
// 	});

// 	const editButton = document.getElementById('change-edit');
// 	editButton.addEventListener('click', (e) => {
// 		e.preventDefault();

// 		sendSaveCipherMessage(true);
// 	});
// }

function sendSaveCipherMessage(edit: boolean, folder?: string) {
	sendPlatformMessage({
		type: 'bgSaveCipher',
		folder,
		edit
	});
}

function handleSaveCipherAttemptCompletedMessage(
	message: NotificationBarWindowMessage
) {
	const addSaveButtonContainers = document.querySelectorAll(
		'.add-change-cipher-buttons'
	);
	const notificationBarOuterWrapper = document.getElementById(
		'notification-bar-outer-wrapper'
	);
	if (message?.error) {
		addSaveButtonContainers.forEach((element) => {
			element.textContent = chrome.i18n.getMessage('saveCipherAttemptFailed');
			element.classList.add('error-message');
			notificationBarOuterWrapper?.classList.add('error-event');
		});

		// logService.error(
		// 	`Error encountered when saving credentials: ${message.error}`
		// );
		return;
	}

	const messageName =
		notificationBarIframeInitData.type === 'add'
			? 'Save vault item success'
			: 'Update vault item success';

	addSaveButtonContainers.forEach((element) => {
		element.textContent = messageName;
		element.classList.add('success-message');
		notificationBarOuterWrapper?.classList.add('success-event');
	});
	setTimeout(() => {
		sendPlatformMessage({ type: 'bgCloseNotificationBar' });
	}, 1250);
}

/**
 * Sets up a port to communicate with the fileless importer content script.
 * This connection to the background script is used to trigger the action of
 * downloading the CSV file from the LP importer or importing the data into
 * the TermiPass vault.
 */

function setContent(template: HTMLTemplateElement) {
	const content = document.getElementById('content');
	while (content?.firstChild) {
		content.removeChild(content.firstChild);
	}

	const newElement = template.content.cloneNode(true) as HTMLElement;
	content?.appendChild(newElement);
}

function sendPlatformMessage(
	msg: Record<string, unknown>,
	responseCallback?: (response: any) => void
) {
	chrome.runtime.sendMessage(msg, (response) => {
		if (responseCallback) {
			responseCallback(response);
		}
	});
}

// function loadFolderSelector() {
// 	const populateFolderData = (folderData: FolderView[]) => {
// 		const select = document.getElementById('select-folder');
// 		if (!folderData?.length) {
// 			select.appendChild(
// 				new Option(chrome.i18n.getMessage('noFoldersFound'), null, true)
// 			);
// 			select.setAttribute('disabled', 'true');
// 			return;
// 		}

// 		select.appendChild(
// 			new Option(chrome.i18n.getMessage('selectFolder'), null, true)
// 		);
// 		folderData.forEach((folder: FolderView) => {
// 			// Select "No Folder" (id=null) folder by default
// 			select.appendChild(new Option(folder.name, folder.id || '', false));
// 		});
// 	};

// 	sendPlatformMessage({ command: 'bgGetFolderData' }, populateFolderData);
// }

// function getSelectedFolder(): string {
// 	return (document.getElementById('select-folder') as HTMLSelectElement).value;
// }

function removeIndividualVault(): boolean {
	return notificationBarIframeInitData.removeIndividualVault || false;
}

function adjustHeight() {
	const data: AdjustNotificationBarMessageData = {
		height: document.querySelector('body')?.scrollHeight || 0
	};
	sendPlatformMessage({
		command: 'bgAdjustNotificationBar',
		data
	});
}

function setupWindowMessageListener() {
	globalThis.addEventListener('message', handleWindowMessage);
}

function handleWindowMessage(event: MessageEvent) {
	if (!windowMessageOrigin) {
		windowMessageOrigin = event.origin;
	}

	if (event.origin !== windowMessageOrigin) {
		return;
	}

	const message = event.data as NotificationBarWindowMessage;
	const handler = notificationBarWindowMessageHandlers[message.command];
	if (!handler) {
		return;
	}

	handler({ message });
}

function setupLogoLink() {
	const logoLink = document.getElementById('logo-link') as HTMLAnchorElement;
	logoLink.title = 'TermiPass';
	const setWebVaultUrlLink = (webVaultURL: string) => {
		const newVaultURL = webVaultURL && decodeURIComponent(webVaultURL);
		if (newVaultURL && newVaultURL !== logoLink.href) {
			logoLink.href = newVaultURL;
		}
	};
	sendPlatformMessage(
		{ command: 'getWebVaultUrlForNotification' },
		setWebVaultUrlLink
	);
}

function setNotificationBarTheme() {
	const theme = notificationBarIframeInitData.theme;
	document.documentElement.classList.add(`theme_${theme}`);
}

function postMessageToParent(message: NotificationBarWindowMessage) {
	globalThis.parent.postMessage(message, windowMessageOrigin || '*');
}
