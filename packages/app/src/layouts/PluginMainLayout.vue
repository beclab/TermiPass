<template>
	<q-layout
		view="lHh Lpr ffr"
		class="plugin-layout"
		style="height: 100vh"
		container
	>
		<plugin-drawer />

		<q-page-container>
			<q-page class="plugin-page-wrapper">
				<div class="plugin-page-content">
					<q-page class="row items-center justify-start plugin-page">
						<router-view />
					</q-page>
				</div>
			</q-page>
		</q-page-container>
	</q-layout>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useDataStore } from '../stores/data';

import { hideHeaderOpt } from './../utils/file';
import { bytetrade } from '@bytetrade/core';

import PluginDrawer from './TermipassLayout/PluginDrawer.vue';
import { getAppPlatform } from '../platform/appPlatform';

const Route = useRoute();
const store = useDataStore();
const fileTitle = ref(store.currentItem);
const isSeahub = ref(false);
const hideOption = ref(false);

const viewMode = ref((store.user && store.user.viewMode) || 'list');

watch(
	() => store.user?.viewMode,
	(newVaule, oldVaule) => {
		if (oldVaule == newVaule) {
			return;
		}
		if (!newVaule) {
			return;
		}
		viewMode.value = newVaule;
	}
);

onMounted(async () => {
	getAppPlatform().homeMounted();
	nextTick(() => {
		bytetrade.observeUrlChange.childPostMessage({
			type: 'Files'
		});
	});
});

onUnmounted(() => {
	getAppPlatform().homeUnMounted();
});

watch(
	() => Route.path,
	(newVaule, oldVaule) => {
		if (newVaule.indexOf('/Files/Seahub') > -1) {
			isSeahub.value = true;
		} else {
			isSeahub.value = false;
		}

		if (oldVaule == newVaule) {
			return;
		}
		if (!newVaule) {
			return;
		}

		getFileTitle(newVaule);
		hideOption.value = hideHeaderOpt(newVaule);
	}
);

const getFileTitle = (path: string) => {
	const splitVal = path.split('/').filter((s) => {
		return s && s.trim();
	});

	if (splitVal[splitVal.length - 1] === 'video') {
		return false;
	}

	fileTitle.value = decodeURIComponent(splitVal[splitVal.length - 1]);
};
</script>

<style lang="scss">
.plugin-layout {
	padding: 12px;
	overflow: hidden;
	background: linear-gradient(
			180deg,
			rgba(254, 255, 228, 0.3) 1.14%,
			rgba(255, 229, 135, 0.3) 99.98%
		),
		linear-gradient(
			186deg,
			rgba(254, 251, 228, 0.9) 9.02%,
			rgba(255, 255, 255, 0.9) 26.6%,
			rgba(251, 251, 233, 0.9) 52.58%,
			rgba(255, 243, 183, 0.9) 71.98%,
			rgba(255, 255, 243, 0.9) 90.98%
		);
	backdrop-filter: blur(50px);
	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		border: 1px solid $background-5;
		z-index: 999999999;
		border-radius: 16px;
		pointer-events: none;
	}
	.plugin-page-wrapper {
		position: relative;
		.plugin-page-content {
			position: absolute;
			top: 0px;
			left: 0px;
			right: 0px;
			bottom: 0px;
		}
	}

	.plugin-page {
		min-height: auto !important;
		width: calc(100%);
		height: calc(100%);
		border-radius: 12px;
		background-color: $background-1;
	}
}
</style>
