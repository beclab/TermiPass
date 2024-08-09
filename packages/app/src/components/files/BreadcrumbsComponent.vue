<template>
	<div class="breadcrumbs">
		<span
			class="row items-center justify-center"
			v-for="(link, index) in items"
			:key="index"
		>
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
import { useRoute } from 'vue-router';
import { useFilesStore } from '../../stores/files';
import { dataAPIs } from './../../api';
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
const filesStore = useFilesStore();

const items = computed(function () {
	const dataAPI = dataAPIs();
	console.log('dataAPIbreadcrumbsBase', dataAPI.breadcrumbsBase);

	const relativePath = route.path;
	const relativequery =
		route.fullPath.indexOf('?') > -1
			? route.fullPath.slice(route.fullPath.indexOf('?'))
			: '';

	let parts = relativePath.split('/');

	console.log('parts0', parts);

	if (parts[0] === '') {
		parts.shift();
	}
	console.log('parts1', parts);

	if (
		parts[0] === 'Files' ||
		parts[0] === 'Seahub' ||
		parts[0] === 'Data' ||
		parts[0] === 'Cache' ||
		parts[0] === 'Drive'
	) {
		parts.shift();
	}
	console.log('parts2', parts);

	if (parts[parts.length - 1] === '') {
		parts.pop();
	}
	console.log('parts3', parts);

	let breadcrumbs: any[] = [];

	if (parts.length === 0) {
		breadcrumbs.push({
			name: dataAPI.breadcrumbsBase.slice(1),
			url: dataAPI.breadcrumbsBase + '/',
			query: relativequery
		});
	} else {
		for (let i = 0; i < parts.length; i++) {
			if (i === 0) {
				breadcrumbs.push({
					name: decodeURIComponent(parts[i]),
					url: dataAPI.breadcrumbsBase + '/' + parts[i] + '/',
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
	}

	console.log('breadcrumbs', breadcrumbs);

	if (breadcrumbs.length > 3) {
		while (breadcrumbs.length !== 4) {
			breadcrumbs.shift();
		}

		breadcrumbs[0].name = '...';
	}

	return breadcrumbs;
});

const go = async (url: string, query: any) => {
	console.log('gogourl', url);
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
	justify-content: center;
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
		display: inline-block;
		max-width: 220px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		&:hover {
			color: $info !important;
		}
	}
}
</style>
