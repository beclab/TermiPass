<template>
	<div class="rss-root">
		<TerminusUserHeader :title="t('info')" />
		<div class="rss-content">
			<div
				class="text-color-title border-color-yellow book-mark text-subtitle2 row items-center justify-center"
				@click="addToBoard"
			>
				<div style="margin-left: 8px">
					{{ t('bookmark_current_page') }}
				</div>
			</div>
			<q-list class="rss-list">
				<div v-if="pageRSSList.length > 0">
					<q-item-label
						header
						class="text-color-title text-body1 rss-base rss-header"
						>{{ t('rss_on_the_current_site') }}</q-item-label
					>
					<q-item
						v-for="(item, index) in pageRSSList"
						clickable
						:key="'RSS site' + index"
						class="rss-base rss-item"
						@click="addToFolder(item)"
					>
						<q-item-section avatar>
							<img class="rss-image" :src="getImage(item)" />
						</q-item-section>
						<q-item-section class="rss-info">
							<q-item-label class="text-color-title text-body2 rss-title">{{
								item.title
							}}</q-item-label>
							<q-item-label class="text-color-sub-title text-body3 rss-url">{{
								item.url
							}}</q-item-label>
						</q-item-section>
						<q-item-section side>
							<img
								src="../../../assets/rss/rss_add.svg"
								:height="32"
								:width="32"
							/>
						</q-item-section>
					</q-item>
				</div>

				<div v-if="pageRSSHubList.length > 0">
					<q-item-label
						header
						class="text-color-title text-body1 rss-base rss-header"
						>{{ t('terminus_rss_for_the_current_page') }}</q-item-label
					>
					<q-item
						v-for="(item, index) in pageRSSHubList"
						clickable
						:key="'RSS page' + index"
						class="rss-base rss-item"
						@click="addToFolder(item)"
					>
						<q-item-section avatar>
							<img class="rss-image" :src="getImage(item)" />
						</q-item-section>
						<q-item-section class="rss-info">
							<q-item-label class="text-color-title text-body2 rss-title">{{
								item.title
							}}</q-item-label>
							<q-item-label class="text-color-sub-title text-body3 rss-url">{{
								item.url.startsWith(rsshubDomain)
									? item.url.substring(rsshubDomain.length)
									: item.url
							}}</q-item-label>
						</q-item-section>

						<q-item-section side>
							<img
								src="../../../assets/rss/rss_add.svg"
								:height="32"
								:width="32"
							/>
						</q-item-section>
					</q-item>
				</div>

				<div v-if="websiteRSSHubList.length > 0">
					<q-item-label
						header
						class="text-color-title text-body1 rss-base rss-header"
						>{{ t('website_for_the_current_page') }}</q-item-label
					>
					<q-item
						v-for="(item, index) in websiteRSSHubList"
						:key="'website page' + index"
						class="rss-base rss-item"
					>
						<q-item-section avatar>
							<img class="rss-image" :src="getImage(item)" />
						</q-item-section>
						<q-item-section class="rss-info">
							<q-item-label class="text-color-title text-body2 rss-title">{{
								item.title
							}}</q-item-label>
							<q-item-label class="text-color-sub-title text-body3 rss-url">{{
								item.url
							}}</q-item-label>
						</q-item-section>
					</q-item>
				</div>
			</q-list>

			<terminus-empty
				v-if="
					pageRSSList.length === 0 &&
					pageRSSHubList.length === 0 &&
					websiteRSSHubList.length === 0
				"
				img-path="layout/nodata.svg"
				:info="t('no_info_data')"
				style="width: 100%; margin-top: 80px"
			>
			</terminus-empty>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { getRequireImage } from '../../../utils/imageUtils';
import TerminusUserHeader from '../../../components/common/TerminusUserHeader.vue';
import TerminusEmpty from '../../../components/common/TerminusEmpty.vue';
import { useI18n } from 'vue-i18n';
import { getAppPlatform } from '../../../platform/appPlatform';
import { ExtensionPlatform } from '../../../platform/bex/front/platform';
import {
	rsshubDomain,
	rsshubReplaceDomain
} from '../../../extension/rss/utils';
import { useBexStore } from '../../../stores/bex';
import { useRssStore } from '../../../stores/rss';
import { useQuasar } from 'quasar';
import {
	notifyFailed,
	notifySuccess
} from '../../../utils/notifyRedefinedUtil';

const rssStore = useRssStore();

const pageRSSList = ref([] as any[]);
const pageRSSHubList = ref([] as any[]);
const websiteRSSHubList = ref([] as any[]);
const controller = useBexStore();
const { t } = useI18n();
const $q = useQuasar();

async function getInfos() {
	const tab = await (
		getAppPlatform() as unknown as ExtensionPlatform
	).getCurrentTab();
	if (!tab || !tab.id || !tab.url) return;
	const { pageRSSHub, pageRSS } = await controller.controller.getAllRSSList(
		tab.id
	);
	pageRSSList.value = pageRSS;
	pageRSSHubList.value = pageRSSHub;
}

getInfos();

const getImage = (item: any) => {
	if (item.image) {
		return getRequireImage(item.image);
	}
	return getRequireImage('rss/rss_default.svg');
};

const addToFolder = async (item: any) => {
	const feed_url = item.url.startsWith(rsshubDomain)
		? rsshubReplaceDomain + item.url.substring(rsshubDomain.length)
		: item.url;

	try {
		const data = await rssStore.create_feed(feed_url);
		$q.loading.hide();
		if (data) {
			notifySuccess(t('add_feed_success'));
		} else {
			notifyFailed(t('add_feed_fail'));
		}
	} catch (e) {
		$q.loading.hide();
	} finally {
		$q.loading.hide();
	}
};

const addToBoard = async () => {
	const tab = await (
		getAppPlatform() as unknown as ExtensionPlatform
	).getCurrentTab();

	if (!tab || !tab.id || !tab.url) return;
	$q.loading.show();
	try {
		await rssStore.addEntry(tab.url);
		$q.loading.hide();
		notifySuccess(t('add_page_success'));
	} catch (error) {
		console.error(error);
		notifyFailed(t('add_page_fail'));
		$q.loading.hide();
	}
};
</script>

<style scoped lang="scss">
.rss-root {
	width: 100%;
	height: 100%;
	background: $white;

	.rss-content {
		height: calc(100% - 64px);
		width: 100%;
		padding: 16px 0;
		overflow-y: scroll;
	}

	.rss-image {
		width: 30px;
		height: 30px;
	}

	.book-mark {
		height: 48px;
		margin-left: 24px;
		margin-right: 24px;
		margin-bottom: 8px;

		border: 1px solid;
		border-color: $yellow;
		border-radius: 140px;

		display: flex;
		align-items: center;
		text-align: center;
	}

	.rss-list {
		width: 100%;
		padding: 0;

		.rss-base {
			padding: 8px 16px;
		}

		.rss-header {
			margin-bottom: 8px;
		}

		.rss-item {
			height: 54px;

			.rss-info {
				width: 240px;
				cursor: pointer;
				display: flex;
				text-decoration: none;
				line-height: 1;
				flex-direction: column;
				justify-content: space-between;
				margin-left: -15px;

				.rss-title {
					width: 100%;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}

				.rss-url {
					width: 100%;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
					display: block;
				}
			}
		}
	}
}
</style>
