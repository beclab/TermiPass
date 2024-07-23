<template>
	<div>
		<component ref="currentComponent" :is="currentComponent" />
	</div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { useDataStore } from '../../../stores/data';

import Help from './Help.vue';
import Info from './InfoDialog.vue';
import Delete from './DeleteDialog.vue';
import Rename from './RenameDialog.vue';
import NewDir from './NewDir.vue';
import NewLib from './NewLib.vue';
// import ReplaceComponent from './ReplaceComponent.vue';
import ShareDialog from './ShareDialog.vue';
import SyncSelectSavePath from './SyncSelectSavePathDialog.vue';

const store = useDataStore();
const show = ref<null | string>(null);

let actionList = [
	'newDir',
	'NewLib',
	'info',
	'rename',
	'delete',
	'share-dialog',
	'help',
	// 'replace',
	'sync-select-save-path'
];
let componentList = [
	NewDir,
	NewLib,
	Info,
	Rename,
	Delete,
	ShareDialog,
	Help,
	SyncSelectSavePath
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

const currentComponent = computed(function () {
	const matched = actionList.indexOf(show.value || '');

	if (matched >= 0 && show.value) {
		return componentList[matched];
	}
	return null;
});
</script>
