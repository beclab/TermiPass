<template>
	<div class="pdf-content">
		<collect-item
			v-for="(item, index) in collectStore.filesList"
			:key="index"
			:item="item"
			class="q-mt-md"
		>
			<template v-slot:image>
				<q-img :src="entryImage(item.file)" class="image-avatar" />
			</template>
			<template v-slot:side>
				<CollectionItemStatus class="status-white-bg">
					<template v-slot:status>
						<q-icon
							v-if="
								!item.record ||
								item.record.status == DOWNLOAD_RECORD_STATUS.REMOVE ||
								item.record.status === DOWNLOAD_RECORD_STATUS.PAUSED
							"
							name="sym_r_add_box"
							size="20px"
							class="text-grey-8 cursor-pointer"
							@click="onDownloadFile(item.file)"
						/>
						<q-knob
							v-if="
								item.record &&
								(item.record.status === DOWNLOAD_RECORD_STATUS.DOWNLOADING ||
									item.record.status === DOWNLOAD_RECORD_STATUS.WAITING ||
									item.record.status === DOWNLOAD_RECORD_STATUS.PAUSED)
							"
							:model-value="
								item.record.progress
									? parseFloat(item.record.progress) / 100
									: parseFloat(item.record.downloaded_bytes) /
									  parseFloat(item.record.size)
							"
							size="20px"
							:min="0"
							:max="1"
							:thickness="0.22"
							color="yellow-7"
							track-color="grey-1"
							class=""
						/>
						<q-icon
							v-if="
								item.record &&
								item.record.status === DOWNLOAD_RECORD_STATUS.ERROR
							"
							name="sym_r_error"
							size="20px"
							class="text-negative"
						/>
						<q-icon
							v-if="
								item.record &&
								item.record.status === DOWNLOAD_RECORD_STATUS.COMPLETE
							"
							name="sym_r_check_circle"
							size="20px"
							class="text-positive"
						/>
					</template>
				</CollectionItemStatus>
			</template>
		</collect-item>
	</div>
</template>

<script setup lang="ts">
import CollectItem from './CollectItem.vue';
import { FILE_TYPE } from './utils';
import CollectionItemStatus from './CollectionItemStatus.vue';
import { getRequireImage } from '../../../utils/imageUtils';
import { useI18n } from 'vue-i18n';
import { useCollectStore } from '../../../stores/collect';
// COMPLETE = 'complete',
// 	ERROR = 'error',
// 	DOWNLOADING = 'downloading',
// 	WAITING = 'waiting',
// 	PAUSED = 'paused',
// 	REMOVE = 'remove'
import { FileInfo, DOWNLOAD_RECORD_STATUS } from '../../../extension/rss/utils';

const { t } = useI18n();

const collectStore = useCollectStore();

const onDownloadFile = (item: FileInfo) => {
	collectStore.addDownloadRecord(item);
};

const entryImage = (item: FileInfo) => {
	switch (item.file_type) {
		case FILE_TYPE.VIDEO:
			return getRequireImage('rss/filetype/video.svg');
		case FILE_TYPE.AUDIO:
			return getRequireImage('rss/filetype/radio.svg');
		case FILE_TYPE.PDF:
			return getRequireImage('rss/filetype/pdf.svg');
		case FILE_TYPE.EBOOK:
			return getRequireImage('rss/filetype/ebook.svg');
		case FILE_TYPE.GENERAL:
			return getRequireImage('rss/filetype/general.svg');
		default:
			return getRequireImage('rss/entry_default_img.svg');
	}
};
</script>

<style scoped lang="scss">
.pdf-content {
	width: 100%;
	height: 100%;

	.image-avatar {
		width: 44px;
		height: 44px;
		border-radius: 8px;
	}

	.status-white-bg {
		background: $background-1;
	}
}
</style>
