<template>
	<div>
		<component ref="currentComponent" :is="currentComponent" />
	</div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useDataStore } from '../../../stores/data';

import Help from './Help.vue';
import Info from './InfoDialog.vue';
import Delete from './DeleteDialog.vue';
import Rename from './RenameDialog.vue';
import Download from './Download.vue';
import Move from './Move.vue';
import Copy from './Copy.vue';
import NewFile from './NewFile.vue';
import NewDir from './NewDir.vue';
import NewLib from './NewLib.vue';
import ReplaceComponent from './ReplaceComponent.vue';
import ReplaceRename from './ReplaceRename.vue';
import ShareDialog from './ShareDialog.vue';
import Upload from './Upload.vue';
import ShareDelete from './ShareDelete.vue';
import SyncSelectSavePath from './SyncSelectSavePathDialog.vue';

const store = useDataStore();
const show = ref<null | string>(null);

let actionList = [
	'info',
	'help',
	'delete',
	'move',
	'copy',
	'newFile',
	'newDir',
	'NewLib',
	'download',
	'replace',
	'replace-rename',
	'share-dialog',
	'upload',
	'share-delete',
	'sync-select-save-path',
	'rename'
];
let componentList = [
	Info,
	Help,
	Delete,
	Move,
	Copy,
	NewFile,
	NewDir,
	NewLib,
	Download,
	ReplaceComponent,
	ReplaceRename,
	ShareDialog,
	Upload,
	ShareDelete,
	SyncSelectSavePath,
	Rename
];
watch(
	() => store.show,
	(newVal, oldVal) => {
		if (oldVal == newVal) {
			return;
		}
		show.value = newVal;
	}
);

onMounted(() => {
	window.addEventListener('keydown', (event) => {
		if (show.value == null) return;

		let prompt: any = currentComponent.value;

		// Esc!
		if (event.keyCode === 27) {
			event.stopImmediatePropagation();
			store.closeHovers();
		}

		// Enter
		if (event.keyCode == 13) {
			switch (show.value) {
				case 'delete':
					prompt.submit();
					break;
				case 'copy':
					prompt.copy(event);
					break;
				case 'move':
					prompt.move(event);
					break;
				case 'replace':
					prompt.showConfirm(event);
					break;
			}
		}
	});
});

const currentComponent = computed(function () {
	const matched = actionList.indexOf(show.value || '');

	if (matched >= 0 && show.value) {
		return componentList[matched];
	}
	return null;
});
</script>
