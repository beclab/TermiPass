<template>
	<div class="preview bg-black">
		<terminus-video-player
			v-if="filesStore.previewItem.path"
			:req="filesStore.previewItem"
			id="videoPlayer"
			:src="`${dataStore.baseURL()}/videos/play?PlayPath=${encodeURIComponent(
				filesStore.previewItem.path
			)}`"
		/>
	</div>
</template>

<script lang="ts" setup>
import { useFilesStore } from './../../../stores/files';
import { useDataStore } from '../../../stores/data';
import TerminusVideoPlayer from '../../../components/common/TerminusVideoPlayer.vue';

const filesStore = useFilesStore();
const dataStore = useDataStore();

console.log('filesStorepreviewItem', filesStore.previewItem);
</script>

<style lang="scss" scoped></style>
