import {
	Field,
	FieldType,
	ITEM_TEMPLATES,
	VaultItem
} from '@didvault/sdk/src/core';
import { app } from '../../globals';
import { Router } from 'vue-router';
import { useMenuStore } from '../../stores/menu';
import { useUserStore } from 'src/stores/user';

export async function updateUIToAddWeb(
	identify: string,
	router: Router,
	username = '',
	password = ''
) {
	const userStore = useUserStore();
	if (!(await userStore.unlockFirst())) {
		return;
	}
	const meunStore = useMenuStore();
	const selectedTemplate = ITEM_TEMPLATES.find((i) => i.id == 'web');
	if (!selectedTemplate) {
		return;
	}
	meunStore.isEdit = true;

	const field = selectedTemplate.fields.find((t) => t.type === FieldType.Url);
	if (field) {
		field.value = identify;
	}
	if (username) {
		const nameField = selectedTemplate.fields.find(
			(t) => t.type === FieldType.Username
		);
		if (nameField) {
			nameField.value = username;
		}
	}
	if (password) {
		const passwordField = selectedTemplate.fields.find(
			(t) => t.type === FieldType.Password
		);
		if (passwordField) {
			passwordField.value = password;
		}
	}

	const item = await addItem(
		// selectedTemplate.toString() || '',
		username ? username : '',
		selectedTemplate.icon,
		selectedTemplate.fields,
		[]
	);

	if (item && router) {
		router.push({
			path: '/items/' + item.id
		});
	}
}

async function addItem(
	name: string,
	icon: string,
	fields: any,
	tags: string[]
): Promise<VaultItem | undefined> {
	const vault = app.mainVault;
	if (!vault) {
		return;
	}
	const item: VaultItem = await app.createItem({
		name,
		vault,
		icon,
		fields: fields.map((f: Field) => new Field({ ...f, value: f.value || '' })),
		tags
	});
	return item;
}
