<template>
	<div v-bind="$attrs" class="videoPlayer">
		<video
			class="video-js vjs-theme-city"
			:id="id"
			style="width: 100%; height: 100%"
		></video>
	</div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
import 'video.js/dist/video-js.css';
import './../../css/video/city.video.css';
// import '@videojs/themes/city/index.css';

const overrideNative = ref(false);
const props = defineProps({
	id: { type: String, default: 'vd' },
	src: { type: String, default: '' },
	poster: { type: String, default: '' }
});

const emit = defineEmits([
	'videoCanplaythrough',
	'videoPlay',
	'videoPlaying',
	'videoPause'
]);

let player: Player;

const Component = videojs.getComponent('Component');
class FastReplayButton extends Component {
	constructor(player, options = {}) {
		super(player, options);
		this.on('click', this.handleClick);
	}
	createEl() {
		return videojs.dom.createEl('button', {
			title: 'Rewind 10s',
			className: 'vjs-fast-replay-button vjs-control vjs-button',
			innerHTML:
				'<span aria-hidden="true" class="vjs-icon-placeholder"></span><span class="vjs-control-text" aria-live="polite">Fast Replay</span>'
		});
	}
	handleClick() {
		play_fast_back();
	}
}
videojs.registerComponent('FastReplayButton', FastReplayButton);

class FastForwardButton extends Component {
	constructor(player, options = {}) {
		super(player, options);
		this.on('click', this.handleClick);
	}
	createEl() {
		return videojs.dom.createEl('button', {
			title: 'Forward 10S',
			className: 'vjs-fast-forward-button vjs-control vjs-button',
			innerHTML:
				'<span aria-hidden="true" class="vjs-icon-placeholder"></span><span class="vjs-control-text" aria-live="polite">Fast Forword</span>'
		});
	}
	handleClick() {
		play_fast_forword();
	}
}
videojs.registerComponent('FastForwardButton', FastForwardButton);

function play_fast_forword() {
	player.currentTime(player.currentTime() + 10);
}

function play_fast_back() {
	player.currentTime(player.currentTime() - 10);
}

function options() {
	return {
		html5: {
			hls: {
				overrideNative: overrideNative.value
			},
			nativeVideoTracks: !overrideNative.value,
			nativeAudioTracks: !overrideNative.value,
			nativeTextTracks: !overrideNative.value
		},
		autoplay: true,
		muted: false,
		loop: false,
		controls: true,
		controlBar: {
			captionsButton: true,
			// chaptersButton: true,
			// subtitlesButton: true,
			remainingTimeDisplay: true,
			progressControl: true,
			fullscreenToggle: true,
			playbackRateMenuButton: true,
			pictureInPictureToggle: false,
			children: [
				'playToggle',
				'FastReplayButton',
				'FastForwardButton',
				'volumePanel',
				'progressControl',
				'remainingTimeDisplay'
			]
		},
		preload: 'auto',
		fluid: true,
		notSupportedMessage:
			'This video cannot be played temporarily, please try again later.',
		playbackRates: [0.5, 1, 1.5, 2],

		sources: [
			{
				src: './TermiV2.mp4',
				// src: props.src,
				type: 'video/mp4'
				// type: 'application/vnd.apple.mpegurl'
			}
		]
	};
}

onMounted(() => {
	try {
		player = videojs(props.id, options(), () => {
			videojs.log('播放器已经准备好了!');
			player.pause();
			player.on('canplaythrough', function (event: any) {
				emit('videoCanplaythrough', event.target.player.cache_?.duration);
			});
			player.on('play', function () {
				videojs.log('视频准备播放');
				emit('videoPlay');
			});
			player.on('playing', function () {
				videojs.log('视频已开始播放');
				emit('videoPlaying');
			});
			player.on('pause', function (event: any) {
				emit('videoPause', event.target.player.cache_?.currentTime);
			});
		});
	} catch (error) {
		console.log('catch', error);
	}
});

onBeforeUnmount(() => {
	if (player) {
		player.dispose();
	}
});
</script>

<style scoped>
.videoPlayer {
	width: 100%;
	height: 100%;
	position: relative;
	overflow: hidden;
}
</style>

<!-- <template>
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
	id: { type: String, default: 'vd' },
	src: { type: String, default: '' },
	poster: { type: String, default: '' }
});

let player: Player;

const videoOptions = {
	autoplay: true,
	controls: true,
	sources: [
		{
			// src: props.raw,
			src: props.src,
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

<style scoped lang="scss"></style> -->
