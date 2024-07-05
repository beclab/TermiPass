<template>
	<video
		id="videoPlayer"
		preload="auto"
		data-setup="{}"
		class="video-js"
		style="width: 100%; height: 100%"
	/>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, PropType } from 'vue';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
import 'video.js/dist/video-js.css';

const props = defineProps({
	raw: {
		type: String
	},
	req: Object as PropType<any>
});

let player: Player;

const videoOptions = {
	autoplay: true,
	controls: true,
	sources: [
		{
			// src: props.raw,
			src: `/videos/play?PlayPath=${props.raw}`,
			// type: 'video/mp4'
			type: 'application/vnd.apple.mpegurl'
		}
	]
};

onMounted(() => {
	player = videojs('videoPlayer', videoOptions, () => {});
});

onBeforeUnmount(() => {
	if (player) {
		player.dispose();
	}
});
</script>

<style scoped lang="scss"></style>
