<template>
	<div
		class="uploadModal bg-background-2"
		:style="{
			visibility: dataState.hideSyncUploadModal ? 'hidden' : 'visible'
		}"
	>
		<div class="uploadHeader row items-center justify-between">
			<div class="row items-center justify-center" v-if="!allFilesUploaded">
				<img
					class="uploadStatus"
					src="../../assets/images/uploading.png"
					alt=""
				/>
				<span class="text-ink-1">
					{{ t('vault_t.uploading_loaded') + ' ' + totalProgress + '%' }}
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
				v-for="(item, index) in syncUploadFileList"
				:key="index"
			>
				<img class="fileIcon" :src="filesIcon(item.fileName)" />
				<div class="content">
					<div class="file-name text-ink-1">
						{{ item.fileName || item?.file?.name }}
					</div>
					<div class="text-ink-2">
						{{
							item.progress()
								? humanStorageSize(Math.round(item.size * item.progress()))
								: '0B'
						}}
						/
						{{ humanStorageSize(item.size) || '0B' }}
					</div>
				</div>

				<div class="row items-center justify-center" v-if="item.error">
					<span class="text-red"> Error </span>
				</div>

				<div
					class="row items-center justify-center"
					v-else-if="item.process === 100"
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
					<div class="row items-center justify-center" v-if="!item.process">
						<span class="text-grey-8"> {{ t('pending') }} </span>
					</div>
					<div v-else class="row items-center justify-center">
						<span> {{ item.process }}% </span>
						<q-circular-progress
							reverse
							:value="item.progress() * 100"
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

<script lang="ts" setup>
import { onUnmounted, ref, toRef } from 'vue';
import { format } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { scrollBarStyle } from '../../utils/contact';
import { seahub } from '../../api';
import { fileList } from '../../utils/constants';
import { useDataStore } from '../../stores/data';

const props = defineProps({
	uploadFileList: {
		type: Array,
		default: () => [],
		required: false
	},
	totalProgress: Number,
	allFilesUploaded: Boolean
});

const emits = defineEmits(['onCloseUploadDialog']);

const syncUploadFileList = toRef(props, 'uploadFileList');
// const { uploadFileList } = toRefs(props);

const route = useRoute();
const dataState = useDataStore();
const { t } = useI18n();
const { humanStorageSize } = format;

const showUpload = ref(true);

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

const toggle = () => {
	showUpload.value = !showUpload.value;
};

const closeUploadModal = () => {
	setTimeout(() => {
		emits('onCloseUploadDialog');
	}, 300);
};

const forWord = async (item: {
	url: string;
	fileName: string;
	path: string;
	relativePath: any;
}) => {
	item.url = route.path + item.fileName;
	item.path = route.path.slice(6) + item.fileName + '/';
	item = await seahub.formatFileContent(item);
	dataState.updateRequest(item);
};

onUnmounted(() => {
	showUpload.value = false;
});
</script>

<style scoped lang="scss">
.uploadModal {
	width: 350px;
	position: fixed;
	right: 20px;
	bottom: 20px;
	box-shadow: 0px 2px 10px $grey-2;
	border-radius: 10px;
	overflow: hidden;
	box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.2);

	.uploadHeader {
		width: 100%;
		height: 48px;
		padding: 0 20px;

		div {
			color: $title;
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
