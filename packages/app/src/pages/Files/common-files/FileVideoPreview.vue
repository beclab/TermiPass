<template>
	<div class="preview bg-black">
		<terminus-video-player
			v-if="raw"
			:req="filesStore.previewItem"
			id="videoPlayer"
			:src="`${dataStore.baseURL()}/videos/play?PlayPath=${encodeURIComponent(
				raw
			)}`"
		/>
	</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useFilesStore } from './../../../stores/files';
import { useDataStore } from '../../../stores/data';
import { DriveType } from '../../../stores/files';
import TerminusVideoPlayer from '../../../components/common/TerminusVideoPlayer.vue';

const filesStore = useFilesStore();
const dataStore = useDataStore();

const raw = computed(function () {
	console.log('filesStorepreviewItem', filesStore.previewItem);
	if (
		filesStore.previewItem.type === 'video' &&
		filesStore.previewItem.driveType === DriveType.Sync
	) {
		const url = new URL(filesStore.previewItem.url);
		return '/Seahub' + url.pathname;
	}

	return filesStore.previewItem.path;
});
</script>

<style lang="scss" scoped></style>
