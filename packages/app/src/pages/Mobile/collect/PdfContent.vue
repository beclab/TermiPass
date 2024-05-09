<template>
	<div class="pdf-content">
		<collect-item
			v-for="(item, index) in pagesList"
			:key="index"
			:item="item"
			class="q-mt-md"
		>
			<template v-slot:image>
				<q-img
					:src="getRequireImage('rss/rss_pdf_img.svg')"
					class="image-avatar"
				/>
			</template>
			<template v-slot:side>
				<CollectionItemStatus class="status-white-bg">
					<template v-slot:status>
						<q-icon
							v-if="item.status === PDFStatus.none"
							name="sym_r_add_box"
							size="20px"
							class="text-grey-8 cursor-pointer"
							@click="onDownloadPdf(item)"
						/>
						<q-knob
							v-if="item.status === PDFStatus.loading"
							:model-value="
								item.progress ? item.progress.download / item.progress.total : 0
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
							v-if="item.status === PDFStatus.error"
							name="sym_r_error"
							size="20px"
							class="text-negative"
						/>
						<q-icon
							v-if="item.status === PDFStatus.success"
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
import { onMounted, ref } from 'vue';
import CollectItem from './CollectItem.vue';
import { DOWNLOAD_STATUS, PDFInfo, PDFStatus } from './utils';
import CollectionItemStatus from './CollectionItemStatus.vue';
import { getRequireImage } from '../../../utils/imageUtils';
import { BtDialog } from '@bytetrade/ui';
import { useI18n } from 'vue-i18n';
import { useRssStore } from '../../../stores/rss';
import { bus } from '../../../utils/bus';

const pagesList = ref<PDFInfo[]>([
	// {
	// 	title: 'Upcoming releases - United States',
	// 	detail: 'https://www.bbc.com/news/world-middle-east-67866346',
	// 	logo: '',
	// 	status: PDFStatus.loading,
	// 	progress: 0.3
	// },
	// {
	// 	title: 'Upcoming releases - United States',
	// 	detail: 'https://www.bbc.com/news/world-middle-east-67866346',
	// 	logo: '',
	// 	status: PDFStatus.error
	// },
	// {
	// 	title: 'Upcoming releases - United States',
	// 	detail: 'https://www.bbc.com/news/world-middle-east-67866346',
	// 	logo: '',
	// 	status: PDFStatus.success
	// }
]);

const { t } = useI18n();
const rssStore = useRssStore();

onMounted(() => {
	// const url = window.location.href;
	const url =
		'https://www.beijing.gov.cn/ywdt/gzdt/202305/P020230529616313576667.pdf';
	if (url.endsWith('.pdf') && pagesList.value.length === 0) {
		pagesList.value.push({
			title: 'Upcoming releases - United States',
			detail: url,
			logo: '',
			status: PDFStatus.none
		});
	}

	bus.on('DOWNLOAD_PROGRESS_UPDATE', (data) => {
		const pdfInfo = pagesList.value.find((item) => item.id === data.id);
		if (pdfInfo) {
			pdfInfo.progress = data;
			if (data.status === DOWNLOAD_STATUS.SUCCESS) {
				pdfInfo.status = PDFStatus.success;
			}
			if (data.status === DOWNLOAD_STATUS.FAILED) {
				pdfInfo.status = PDFStatus.error;
			}
		}
	});
});

const onDownloadPdf = (item: PDFInfo) => {
	const array = item.detail.split('/');
	let fileName = '';
	if (array.length > 0) {
		fileName = array[array.length - 1];
	}
	BtDialog.show({
		title: t('rename_file'),
		okStyle: {
			background: '#FF7733',
			color: '#ffffff'
		},
		cancel: true,
		prompt: {
			model: fileName,
			type: 'text', // optional
			name: t('pdf_name'),
			placeholder: t('input_pdf_name')
		}
	})
		.then((name: any) => {
			if (name) {
				rssStore.downloadPdf(item.detail, name).then((result) => {
					if (result) {
						item.id = result;
						item.status = PDFStatus.loading;
					}
				});
			}
		})
		.catch((err: Error) => {
			console.log('click ok', err);
		});
};
</script>

<style scoped lang="scss">
.pdf-content {
	width: 100%;
	height: 100%;

	.image-avatar {
		width: 44px;
		height: 44px;
	}

	.status-white-bg {
		background: #fff;
	}
}
</style>
