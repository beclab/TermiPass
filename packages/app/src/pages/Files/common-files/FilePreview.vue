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
			{{ raw }}
			<ExtendedImage
				v-if="store.req.type == 'image'"
				:src="raw"
			></ExtendedImage>
			<div
				v-else-if="store.req.type == 'audio'"
				class="audio-container column justify-between items-center q-pb-lg q-px-md"
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
				<audio
					ref="player"
					:src="raw"
					controls
					:autoplay="autoPlay"
					@play="autoPlay = true"
				></audio>
			</div>
			<!-- <vue3-video-player
				v-else-if="store.req.type == 'video'"
				@play="autoPlay = true"
				:src="raw"
			/> -->
			<terminus-video-player v-else-if="store.req.type == 'video'" :raw="raw" />

			<object
				v-else-if="store.req?.extension?.toLowerCase() == '.pdf'"
				class="pdf"
				:data="raw"
			></object>
			<vue-office-docx
				v-else-if="store.req?.extension?.toLowerCase() == '.doc'"
				:src="raw"
			/>
			<vue-office-excel
				v-else-if="store.req?.extension?.toLowerCase() == '.xlsx'"
				:src="raw"
			/>
		</div>
	</template>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { common as api } from '../../../api';
import { useDataStore } from '../../../stores/data';
import ExtendedImage from '../../../components/files/ExtendedImage.vue';
import TerminusVideoPlayer from '../../../components/common/TerminusVideoPlayer.vue';
import { OriginType } from './../../../api/common/encoding';
// import VueOfficeDocx from '@vue-office/docx';
// import VueOfficeExcel from '@vue-office/excel';

// import '@vue-office/docx/lib/index.css';
// import '@vue-office/excel/lib/index.css';

import { shallowRef } from 'vue';

export default defineComponent({
	name: 'FilePreview',
	components: {
		ExtendedImage,
		// VueOfficeDocx,
		// VueOfficeExcel,
		TerminusVideoPlayer
	},
	setup() {
		const store = useDataStore();

		const raw = computed(function () {
			if (store.req.type === 'image' && !store.preview.fullSize) {
				return api.getPreviewURL(store.req, 'big');
			}

			if (store.req.type === 'pdf' && store.req.origin === OriginType.SYNC) {
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

<style language="scss" scoped>
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
