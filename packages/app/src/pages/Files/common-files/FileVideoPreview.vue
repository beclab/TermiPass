<template>
	<div class="preview bg-black">
		<div class="text-white">{{ filesStore.previewItem.path }}</div>
		<terminus-video-player
			v-if="filesStore.previewItem.path"
			:req="filesStore.previewItem"
			id="videoPlayer"
			:src="`/videos/play?PlayPath=${encodeURIComponent(
				filesStore.previewItem.path
			)}`"
		/>
	</div>
</template>

<script lang="ts" setup>
import { useFilesStore } from './../../../stores/files';
import TerminusVideoPlayer from '../../../components/common/TerminusVideoPlayer.vue';

const filesStore = useFilesStore();

console.log('filesStorepreviewItem', filesStore.previewItem);
</script>

<style lang="scss" scoped></style>
