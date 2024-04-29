<template>
	<video id="videoPlayer" class="video-js" style="width: 100%; height: 100%" />
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
// import 'video.js/dist/video-js.css';
import 'video.js/dist/video-js.css';

const props = defineProps({
	raw: {
		type: String
	}
});

let player: Player;

const videoOptions = {
	autoplay: true,
	controls: true,
	sources: [
		{
			src: props.raw,
			type: 'video/mp4'
		}
	]
};

onMounted(() => {
	player = videojs('videoPlayer', videoOptions, () => {
		console.log();
	});
});

onBeforeUnmount(() => {
	if (player) {
		player.dispose();
	}
});
</script>

<style scoped lang="scss"></style>
