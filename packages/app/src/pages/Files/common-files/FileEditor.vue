<template>
	<div id="editor-container" v-show="store.preview.isEditing">
		<form id="editor"></form>
	</div>
	<div
		class="info-content text-subtitle3"
		:class="$q.platform.is.mobile ? 'q-pa-md' : 'q-pa-lg'"
		v-if="!store.preview.isEditing"
	>
		{{ filesStore.previewItem.content }}
	</div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, onUnmounted } from 'vue';
import ace from 'ace-builds/src-min-noconflict/ace.js';
import modelist from 'ace-builds/src-min-noconflict/ext-modelist.js';
import { useDataStore } from '../../../stores/data';
import { files as api, seahub } from '../../../api';
import { useQuasar } from 'quasar';
import 'ace-builds/webpack-resolver';
import { checkSeahub } from '../../../utils/file';
import { useFilesStore } from '../../../stores/files';

import { notifyFailed } from '../../../utils/notifyRedefinedUtil';
import { dataAPIs } from '../../../api';

const store = useDataStore();
const editor = ref();
const $q = useQuasar();
const filesStore = useFilesStore();
const dataAPI = dataAPIs();

onMounted(async () => {
	if (filesStore.previewItem.content == undefined) {
		filesStore.previewItem = await dataAPI.formatFileContent(
			filesStore.previewItem
		);
	}

	const fileContent = filesStore.previewItem.content || '';

	editor.value = ace.edit('editor', {
		value: fileContent,
		showPrintMargin: false,
		readOnly: filesStore.previewItem.type === 'textImmutable',
		theme: 'ace/theme/chrome',
		mode: modelist.getModeForPath(filesStore.previewItem.name).mode,
		wrap: true
	});
});

onUnmounted(() => {
	store.preview.isSaving = false;
	store.preview.isEditing = false;
});

const save = async () => {
	let editorValue = editor.value.getValue();
	try {
		editorValue = (editorValue as string).trim();
		if (checkSeahub(filesStore.previewItem.url)) {
			await seahub.updateFile(
				filesStore.previewItem,
				editorValue,
				$q.platform.is.nativeMobile
			);
		} else {
			await api.put(filesStore.previewItem.url, editorValue);
		}

		filesStore.previewItem.content = editorValue;
		store.preview.isSaving = false;
		store.preview.isEditing = false;
	} catch (e) {
		store.preview.isSaving = false;
		notifyFailed(e.message);
	}
};
watch(
	() => store.preview.isSaving,
	() => {
		if (store.preview.isSaving) {
			save();
		}
	}
);
</script>
<style scoped lang="scss">
.file-editor-root {
	width: 100%;
	height: 100%;
}

.info-content {
	color: $grey-10;
	overflow-y: scroll;
	height: 100%;
	white-space: pre-wrap;
	word-wrap: break-word;
}
</style>
