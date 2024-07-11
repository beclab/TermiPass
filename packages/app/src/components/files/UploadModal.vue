<template>
	<div class="uploadModal bg-background-2" v-if="showUploadModal">
		<div class="uploadHeader row items-center justify-between">
			<div
				class="row items-center justify-center"
				v-if="uploadSrore.filesInUploadCount"
			>
				<img
					class="uploadStatus"
					src="../../assets/images/uploading.png"
					alt=""
				/>
				<span class="text-ink-1">
					{{
						t('vault_t.uploading_loaded_total', {
							loaded: uploadSrore.filesInUploadCount,
							total: uploadSrore.uploadQueue.length
						})
					}}
				</span>
			</div>
			<div class="row items-center justify-center" v-else>
				<img
					class="uploadStatus"
					src="../../assets/images/uploaded.png"
					alt=""
				/>
				<span class="text-ink-1">{{ t('all_uploaded_successfully') }}</span>
			</div>
			<span>
				<q-icon
					class="q-mr-md cursor-pointer"
					rounded
					:name="showUpload ? 'bi-chevron-down' : 'bi-chevron-up'"
					size="1.1em"
					@click="toggle"
				></q-icon>
				<q-icon
					class="cursor-pointer"
					rounded
					name="bi-x-lg"
					size="1.1em"
					@click="closeUploadModal"
				></q-icon>
			</span>
		</div>

		<q-scroll-area
			:thumb-style="scrollBarStyle.thumbStyle"
			:class="
				showUpload ? 'uploadContent heightFull' : 'uploadContent heightZero'
			"
		>
			<div
				class="uploadItem row items-center justify-between q-py-sm"
				v-for="(item, index) in uploadSrore.filesInUpload"
				:key="index"
			>
				<img class="fileIcon" :src="filesIcon(item.name)" />
				<div class="content">
					<div class="file-name text-ink-1">
						{{ item.name || item?.file?.name }}
					</div>
					<div class="text-ink-2">
						{{ item.progressFormat || '0B' }} /
						{{ item.sizeFormat || '0B' }}
					</div>
				</div>

				<div class="row items-center justify-center" v-if="item.status === 1">
					<span class="text-red"> {{ t('error') }} </span>
				</div>

				<!-- <div
					class="row items-center justify-center"
					v-else-if="item.status !== 0 && item.progress === 100"
				>
					<span> 99% </span>
					<q-circular-progress
						reverse
						:value="99"
						size="14px"
						color="light-blue"
						class="q-ml-xs"
					/>
				</div> -->

				<div
					class="row items-center justify-center"
					v-else-if="item.status === 0 || item.progress === 100"
				>
					<q-icon
						class="forword"
						rounded
						name="bi-search"
						size="1.1em"
						@click="forWord(item)"
					></q-icon>
				</div>

				<template v-else>
					<div class="row items-center justify-center" v-if="!item.progress">
						<span class="text-grey-8"> {{ t('pending') }} </span>
					</div>
					<div v-else class="row items-center justify-center">
						<span> {{ item.progress }}% </span>
						<q-circular-progress
							reverse
							:value="item.progress"
							size="14px"
							color="light-blue"
							class="q-ml-xs"
						/>
					</div>
				</template>
			</div>
		</q-scroll-area>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref, onUnmounted, watch } from 'vue';
import { useDataStore } from '../../stores/data';
import { useFilesUploadStore } from '../../stores/files-upload';
import { fileList } from '../../utils/constants';
import { scrollBarStyle } from '../../utils/contact';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { dataAPIs } from '../../api';
import { OriginType } from '../../api/common/encoding';
import { checkSeahub } from '../../utils/file';

export default defineComponent({
	name: 'UploadModal',
	components: {},
	setup() {
		const store = useDataStore();
		const uploadSrore = useFilesUploadStore();

		const { t } = useI18n();

		const Router = useRouter();
		const Route = useRoute();
		const showUpload = ref(true);
		const showUploadModal = ref(store.showUploadModal);
		const uploadQueue = ref(uploadSrore.uploadQueue);

		const uploadQueueData = ref();

		watch(
			() => store.showUploadModal,
			(newVal) => {
				showUploadModal.value = newVal;

				if (!newVal) {
					uploadSrore.uploadQueue = [];
					uploadSrore.id = 0;
				}
			}
		);

		onUnmounted(() => {
			showUpload.value = false;
		});

		const forWord = async (item: any) => {
			let dataAPI: any;
			if (checkSeahub(item.path)) {
				dataAPI = dataAPIs(OriginType.SYNC);
			} else {
				dataAPI = dataAPIs(OriginType.DRIVE);
			}

			dataAPI.openPreview(item, Router);
		};

		const toggle = () => {
			showUpload.value = !showUpload.value;
		};

		const closeUploadModal = () => {
			setTimeout(() => {
				store.changeUploadModal(false);
			}, 300);
		};

		const filesIcon = (name: string) => {
			const h = name?.substring(name?.lastIndexOf('.') + 1);
			let src = '/img/';
			if (process.env.PLATFORM == 'DESKTOP') {
				src = './img/';
			}

			const hasFile = fileList.find((item: any) => item === h);
			if (hasFile) {
				src = src + h + '.png';
			} else {
				src = src + 'blob.png';
			}
			return src;
		};

		return {
			toggle,
			forWord,
			filesIcon,
			closeUploadModal,
			store,
			showUpload,
			uploadSrore,
			uploadQueue,
			showUploadModal,
			uploadQueueData,
			scrollBarStyle,
			t
		};
	}
});
</script>

<style scoped lang="scss">
.uploadModal {
	width: 350px;
	position: fixed;
	right: 20px;
	bottom: 20px;
	box-shadow: 0px 2px 10px $grey-2;
	border-radius: 12px;
	overflow: hidden;
	box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.2);

	.uploadHeader {
		width: 100%;
		height: 48px;
		padding: 0 20px;

		div {
			color: $ink-1;
			font-weight: 700;

			.uploadStatus {
				width: 20px;
				margin-right: 10px;
			}
		}
	}

	.uploadContent {
		transition: height 0.3s;

		.uploadItem {
			padding-left: 20px;
			padding-right: 20px;

			.fileIcon {
				width: 24px;
			}

			.content {
				flex: 1;
				padding: 0 12px;
				overflow: hidden;

				div {
					width: 220px;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}
			}

			.forword {
				cursor: pointer;
			}

			&:hover {
				background-color: $background-hover;
			}
		}
	}

	.heightFull {
		height: 180px;
	}

	.heightZero {
		height: 0;
	}
}
</style>
