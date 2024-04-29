import { FieldType, VaultItem } from '@didvault/sdk/src/core';
import { browser } from 'webextension-polyfill-ts';

export const CONTEXT_MENUS_ROOT_ID = 'root';
export const CONTEXT_MENUS_AUTOFILL_ID = 'autofill';
export const CONTEXT_MENUS_DOWNLOAD_ID = 'download';
export const CONTEXT_MENUS_LOCKED = 'locked';
export const CONTEXT_MENUS_NO_DATA = 'no data';
export const CONTEXT_MENUS_SEND_ID = 'send';

async function createMenuItem(options: {
	id?: string;
	parentId?: string;
	title?: string;
}) {
	return new Promise<void>((resolve, reject) => {
		try {
			browser.contextMenus.create(
				{
					type: 'normal',
					contexts: ['all'],
					id: options.id,
					parentId: options.parentId,
					title: options.title
				},
				() => {
					if (browser.runtime.lastError) {
						reject(browser.runtime.lastError);
						return;
					}
					resolve();
				}
			);
		} catch (error) {
			console.log(error);
		}
	});
}

export async function removeAllMenu() {
	return browser.contextMenus.removeAll();
}

export async function createChildMenuItem(
	parent: string,
	id: string,
	title: string
) {
	const menuItemId = `${parent}_${id}`;
	return await createMenuItem({
		id: menuItemId,
		parentId: parent,
		title: title
	});
}

export async function updateLockedContextMenu() {
	await removeAllMenu();
	await createMenuItem({
		id: CONTEXT_MENUS_ROOT_ID,
		title: 'Vault'
	});

	await createMenuItem({
		id: CONTEXT_MENUS_LOCKED,
		parentId: CONTEXT_MENUS_ROOT_ID,
		title: 'Has been locked, please unlock first'
	});
}

export async function updateDataContextMenu(vaults: VaultItem[]) {
	await removeAllMenu();
	await createMenuItem({
		id: CONTEXT_MENUS_ROOT_ID,
		title: 'Vault'
	});

	await createMenuItem({
		id: CONTEXT_MENUS_AUTOFILL_ID,
		parentId: CONTEXT_MENUS_ROOT_ID,
		title: 'Auto Fill'
	});

	if (vaults.length > 0) {
		vaults.forEach((vault) => {
			const title = vault.fields.find((it) => it.type == FieldType.Username);
			if (title) {
				createChildMenuItem(CONTEXT_MENUS_AUTOFILL_ID, vault.id, title.value);
			}
		});
	} else {
		await createMenuItem({
			id: CONTEXT_MENUS_NO_DATA,
			parentId: CONTEXT_MENUS_AUTOFILL_ID,
			title: 'No match to data information'
		});
	}
}

export async function addDownloadMenu() {
	await createMenuItem({
		id: CONTEXT_MENUS_DOWNLOAD_ID,
		parentId: CONTEXT_MENUS_ROOT_ID,
		title: 'Download'
	});

	await createMenuItem({
		id: CONTEXT_MENUS_SEND_ID,
		parentId: CONTEXT_MENUS_DOWNLOAD_ID,
		title: 'Send to TermiPass'
	});
}
