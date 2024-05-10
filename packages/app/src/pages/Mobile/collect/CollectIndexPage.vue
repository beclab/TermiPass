<template>
	<div class="collect-root q-px-lg">
		<div class="collect-root__header text-h4 text-grey-10 row items-center">
			Collect
		</div>
		<div
			class="collect-root__slider bg-grey-1 q-mt-md row items-center"
			v-if="items.length > 0"
		>
			<div
				v-for="(item, index) in items.filter((data) => data.show)"
				:key="item.identify"
				class="slider-item row items-center justify-center text-body2 text-grey-6"
				:class="
					item.identify === activeItem
						? 'slider-item-select text-subtitle2 text-grey-10'
						: ''
				"
				:style="`width:calc((100% - ${(items.length - 1) * 4}px)/${
					items.length
				}); margin-right: ${index === items.length - 1 ? '0px' : '4px'}`"
				@click="activeItem = item.identify"
			>
				<q-icon :name="item.icon" size="20px" class="q-mr-xs" />
				<div>{{ item.name }}</div>
			</div>
		</div>

		<q-tab-panels v-model="activeItem" animated class="q-mt-lg">
			<q-tab-panel
				class="tab-common"
				v-for="item in items.filter((data) => data.show)"
				:key="item.identify"
				:name="item.identify"
			>
				<div class="text-body2 text-grey-8">{{ item.moduleTitle }}</div>
				<page-content v-if="item.identify === 'page'" />
				<rss-content v-if="item.identify === 'rss'" />
				<pdf-content v-if="item.identify === 'pdf'" />
			</q-tab-panel>
		</q-tab-panels>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import PageContent from './PageContent.vue';
import RssContent from './RssContent.vue';
import PdfContent from './PdfContent.vue';
import { useBexStore } from '../../../stores/bex';
import { getAppPlatform } from '../../../platform/appPlatform';
import { ExtensionPlatform } from '../../../platform/bex/front/platform';
import { useCollectStore } from '../../../stores/collect';

const items = ref([
	{
		name: 'Page',
		icon: 'sym_r_wysiwyg',
		identify: 'page',
		moduleTitle: 'Collectable Content on Page',
		show: true
	},
	{
		name: 'Rss',
		icon: 'sym_r_rss_feed',
		identify: 'rss',
		moduleTitle: 'RSS on Page',
		show: true
	},
	{
		name: 'PDF',
		icon: 'sym_r_picture_as_pdf',
		identify: 'pdf',
		moduleTitle: 'PDF on Page',
		show: true
	}
]);

const activeItem = ref(items.value[0].identify);
const controller = useBexStore();
const collectStore = useCollectStore();

async function getInfos() {
	const tab = await (
		getAppPlatform() as unknown as ExtensionPlatform
	).getCurrentTab();
	if (!tab || !tab.id || !tab.url) {
		return;
	}
	const { pageRSSHub, pageRSS } = await controller.controller.getAllRSSList(
		tab.id
	);
	console.log(tab);
	let list = [];
	list = list.concat(pageRSSHub).concat(pageRSS);
	console.log(list);

	if (list.length === 0) {
		const rss = items.value.find((item) => item.name === 'Rss');
		if (rss) {
			rss.show = false;
		}
	}

	if (tab.url.endsWith('.pdf')) {
		const page = items.value.find((item) => item.name === 'Page');
		if (page) {
			page.show = false;
		}
	} else {
		const pdf = items.value.find((item) => item.name === 'PDF');
		if (pdf) {
			pdf.show = false;
		}
	}

	collectStore.setRssList(
		[
			{
				title: tab.title,
				url: tab.url,
				image: tab.favIconUrl
			}
		],
		list
	);
}

getInfos();
</script>

<style scoped lang="scss">
.collect-root {
	width: 100%;
	height: 100%;
	background-color: #fff;

	&__header {
		width: 100%;
		height: 56px;
	}

	&__slider {
		width: 100%;
		height: 44px;
		border-radius: 32px;
		padding: 4px;
		.slider-item {
			height: 100%;
		}

		.slider-item-select {
			background-color: #fff;
			border-radius: 18px;
		}
	}

	.tab-common {
		padding: 0;
	}
}
</style>
