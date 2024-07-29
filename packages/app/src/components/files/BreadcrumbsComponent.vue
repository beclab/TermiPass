<template>
	<div class="breadcrumbs">
		<!-- <component
			:is="element"
			:to="base || ''"
			:aria-label="$t('files.home')"
			:title="$t('files.home')"
		>
			<i class="material-icons">home</i>
		</component> -->

		<span v-for="(link, index) in items" :key="index">
			<span class="chevron" v-if="index > 0">
				<i class="material-icons">keyboard_arrow_right</i>
			</span>
			<span
				class="text-ink-1 link-text"
				:class="index === items.length - 1 ? 'text-h6' : 'text-body1 '"
				@click="go(link.url, link.query)"
				>{{ link.name }}</span
			>
		</span>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useFilesStore } from '../../stores/files';
import { formatUrltoDriveType } from './../../api/common/common';

const props = defineProps({
	base: {
		type: String,
		required: false,
		default: ''
	},
	noLink: {
		type: Boolean,
		required: false,
		default: false
	}
});

const route = useRoute();
const router = useRouter();
const filesStore = useFilesStore();

const items = computed(function () {
	const relativePath = route.path;
	const relativequery =
		route.fullPath.indexOf('?') > -1
			? route.fullPath.slice(route.fullPath.indexOf('?'))
			: '';

	let parts = relativePath.split('/');

	if (parts[0] === '') {
		parts.shift();
	}

	if (parts[0] === 'Files') {
		parts.shift();
	}

	if (parts[parts.length - 1] === '') {
		parts.pop();
	}

	let breadcrumbs: any[] = [];

	for (let i = 0; i < parts.length; i++) {
		if (i === 0) {
			breadcrumbs.push({
				name: decodeURIComponent(parts[i]),
				url: props.base + '/' + parts[i] + '/',
				query: relativequery
			});
		} else {
			breadcrumbs.push({
				name: decodeURIComponent(parts[i]),
				url: breadcrumbs[i - 1].url + parts[i] + '/',
				query: relativequery
			});
		}
	}

	if (breadcrumbs.length > 3) {
		while (breadcrumbs.length !== 4) {
			breadcrumbs.shift();
		}

		breadcrumbs[0].name = '...';
	}

	return breadcrumbs;
});

const go = async (url: string, query: any) => {
	const driveType = await formatUrltoDriveType(url);
	filesStore.setBrowserUrl(url + query, driveType);
};
</script>

<style lang="scss" scoped>
.breadcrumbs {
	height: 3em;
}

.breadcrumbs {
	display: flex;
	align-items: center;
	color: #6f6f6f;

	.chevron {
		width: 20px;
		height: 20px;
		display: inline-block;
		text-align: center;
		line-height: 20px;
	}

	.link-text {
		cursor: pointer;
		&:hover {
			color: $info !important;
		}
	}
}
</style>
