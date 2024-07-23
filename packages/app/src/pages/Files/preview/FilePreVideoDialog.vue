<template>
	<q-dialog
		v-model="dialog"
		persistent
		:maximized="maximizedToggle"
		transition-show="slide-up"
		transition-hide="slide-down"
	>
		<div id="video-previewer">
			<div class="header row items-center justify-between">
				<div class="title text-ink-on-brand text-h5">{{ title }}</div>
				<div>
					<q-btn
						dense
						flat
						color="white"
						icon="sym_r_close"
						@click="close"
						v-close-popup
					>
					</q-btn>
				</div>
			</div>
			<div class="content bg-background-2">
				<file-video-preview />
			</div>
		</div>
	</q-dialog>
</template>

<script setup lang="ts">
import { useDataStore } from '../../../stores/data';
import { useFilesStore } from '../../../stores/files';
import FileVideoPreview from '../common-files/FileVideoPreview.vue';

import { onMounted, onUnmounted, ref, onBeforeMount } from 'vue';

const dialog = ref(false);

const maximizedToggle = ref(true);

const store = useDataStore();
const filesStore = useFilesStore();

const title = ref(filesStore.previewItem.name);

const isDark = ref(false);

onBeforeMount(() => {
	store.preview.isShow = true;
});

onMounted(() => {
	isDark.value = false;
});

const close = () => {
	dialog.value = false;
};

onUnmounted(() => {
	store.preview.fullSize = false;
	store.preview.isShow = false;
});
</script>

<style scoped lang="scss">
#video-previewer {
	position: relative;
	background-color: rgba(0, 0, 0, 0);
	padding: 12px;
	height: 100%;
}

#video-previewer .preview {
	text-align: center;
	height: 100%;
}

#video-previewer .content {
	height: 100%;
	border-radius: 12px;
	overflow: hidden;
}

.header {
	position: absolute;
	width: calc(100% - 24px);
	height: 56px;
	z-index: 1;
	padding: 0 12px;
}
</style>
