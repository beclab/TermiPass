<template>
	<div class="video-preview-root">
		<div v-if="store.req.type == 'image'" class="image-container">
			<ExtendedImage :src="raw" class="img-part" />
			<div class="row items-center justify-center q-mt-lg">
				<div
					class="operation-part text-body3 q-px-md q-py-xs"
					@click="fullSize = !fullSize"
				>
					{{
						!fullSize
							? t('files.view_original_image') + ' ' + size
							: t('files.view_preview_image')
					}}
				</div>
			</div>
		</div>

		<div
			v-else-if="store.req.type == 'audio'"
			class="audio-container column justify-between items-center"
		>
			<div class="audio-info column items-center justify-center">
				<img
					src="../../../assets/images/file-audio.svg"
					width="96"
					height="96"
				/>
				<div class="audio-name text-body3 q-mt-md text-color-title">
					{{ store.req.name }}
				</div>
			</div>
			<div
				style="height: 20%; width: 100%; padding: 20px"
				class="row items-center justify-center"
			>
				<audio
					:src="raw"
					controls
					:autoplay="autoPlay"
					@play="autoPlay = true"
					style="height: 20px"
				></audio>
			</div>
		</div>
		<div v-else-if="store.req.type == 'video'" class="video-container">
			<!-- <vue3-video-player
				@play="autoPlay = true"
				:src="raw"
				style="width: 100%"
			/> -->
			<terminus-video-player :raw="store.req.path" :req="store.req" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { useDataStore } from '../../../stores/data';
import ExtendedImage from '../../../components/files/ExtendedImage.vue';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { files as api } from '../../../api';
import { format, useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { getNativeAppPlatform } from '../../../platform/capacitor/capacitorPlatform';
import TerminusVideoPlayer from '../../../components/common/TerminusVideoPlayer.vue';
import { StatusBar } from '@capacitor/status-bar';

const { humanStorageSize } = format;
const store = useDataStore();
const autoPlay = ref(false);
const fullSize = ref(false);
const $q = useQuasar();

const { t } = useI18n();

const size = ref(humanStorageSize(store.req.size ?? 0));

const raw = computed(function () {
	if (store.req.type === 'image' && !fullSize.value) {
		return api.getPreviewURL(store.req, 'big');
	}
	return api.getDownloadURL(store.req, true);
});

onMounted(() => {
	if ($q.platform.is.nativeMobile && store.req.type == 'video') {
		ScreenOrientation.unlock();
		StatusBar.hide();
	}
});

onUnmounted(() => {
	if ($q.platform.is.nativeMobile && store.req.type == 'video') {
		// ScreenOrientation.unlock();
		getNativeAppPlatform().resetOrientationLockType();
		StatusBar.show();
	}
});
</script>

<style scoped lang="scss">
.video-preview-root {
	width: 100%;
	height: 100%;
	background: $shadow-color;
}

audio {
	width: 100%;
	outline: none;
}

.image-container {
	width: 100%;
	height: 100%;

	.img-part {
		height: calc(100% - 150px);
		width: 100%;
	}

	.operation-part {
		text-align: right;
		color: $grey-4;
		border: 1px solid $grey-2;
		border-radius: 4px;
		text-align: center;
	}
}

/* 包裹播放器的容器 */
.audio-container {
	width: 100%;
	height: 100%;

	.audio-info {
		height: 80%;
		width: 100%;

		.audio-name {
			text-align: center;
			color: $grey-5;
		}
	}
}

.video-container {
	width: 100%;
	height: 100%;

	audio::-webkit-media-controls-panel {
		background-color: white;
		border-radius: 8px;
	}

	input[type='range'] {
		width: 100%;
		height: 5px;
		-webkit-appearance: none;
		background-color: $grey-12;
		border-radius: 5px;
		outline: none;
		margin-top: 5px;
	}
}
</style>
