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
import SettingsPlugin from '../video_plugins/SettingsPlugin';
import QualityPlugin from '../video_plugins/QualityPlugin';
import { useUserStore } from '../../stores/user';

const overrideNative = ref(true);
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
				src: props.src,
				type: 'application/vnd.apple.mpegurl'
			}
		]
	};
}

onMounted(() => {
	const userStore = useUserStore();
	try {
		(videojs as any).Vhs.xhr.onRequest((req) => {
			console.log('videojs request ===>');
			console.log(req);
			if (!req.headers) {
				req.headers = {
					'X-Authorization': userStore.current_user?.access_token
				};
			} else {
				req.headers = {
					...req.headers,
					'X-Authorization': userStore.current_user?.access_token
				};
			}
			return req;
		});
		// console.log(videojs.Vhs);

		player = videojs(props.id, options(), () => {
			videojs.log('player ready!');
			player.pause();
			player.on('canplaythrough', function (event: any) {
				emit('videoCanplaythrough', event.target.player.cache_?.duration);
			});
			player.on('play', function () {
				videojs.log('player start');
				emit('videoPlay');
			});
			player.on('playing', function () {
				videojs.log('playing');
				emit('videoPlaying');
			});
			player.on('pause', function (event: any) {
				emit('videoPause', event.target.player.cache_?.currentTime);
			});
		});

		console.log('player ===>');
		console.log(player);

		videojs.registerPlugin('settingsPlugin', SettingsPlugin);
		videojs.registerPlugin('qualityPlugin', QualityPlugin);

		(player as any).settingsPlugin();
		(player as any).qualityPlugin();
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

<style lang="scss">
.videoPlayer {
	width: 100%;
	height: 100%;
	position: relative;
	overflow: hidden;
}
</style>
