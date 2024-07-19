<template>
	<BtLoading
		:show="true"
		v-if="store.loading"
		textColor="#4999ff"
		color="#4999ff"
		text=""
		backgroundColor="rgba(0, 0, 0, 0)"
	>
	</BtLoading>
	<template v-else>
		<div class="preview">
			<terminus-video-player
				:req="store.req"
				id="videoPlayer"
				:src="`/videos/play?PlayPath=${store.req.path}`"
			/>
		</div>
	</template>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { files as api } from '../../../api';
import { useDataStore } from '../../../stores/data';
import TerminusVideoPlayer from '../../../components/common/TerminusVideoPlayer.vue';

import { shallowRef } from 'vue';

export default defineComponent({
	name: 'FilePreview',
	components: {
		TerminusVideoPlayer
	},
	setup() {
		const store = useDataStore();

		const raw = computed(function () {
			if (store.req.type === 'image' && !store.preview.fullSize) {
				return api.getPreviewURL(store.req, 'big');
			}

			if (store.req.type === 'pdf' && store.req.checkSeahub) {
				return store.req.url;
			}

			return api.getDownloadURL(store.req, true);
		});
		const autoPlay = shallowRef(true);
		return {
			store,
			raw,
			autoPlay
		};
	}
});
</script>

<style lang="scss" scoped>
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
</style>
