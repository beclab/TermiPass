<template>
	<div class="breadcrumbs">
		<component
			:is="element"
			:to="base || ''"
			:aria-label="$t('files.home')"
			:title="$t('files.home')"
		>
			<i class="material-icons">home</i>
		</component>

		<span v-for="(link, index) in items" :key="index">
			<span class="chevron">
				<i class="material-icons">keyboard_arrow_right</i>
			</span>
			<component :is="element" :to="link.url">{{ link.name }}</component>
		</span>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDataStore } from '../../stores/data';

defineProps(['base', 'noLink']);

const store = useDataStore();

const items = computed(function () {
	const relativePath = store.req.path;
	let parts = relativePath.split('/');

	if (parts[0] === '') {
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
				url: this.base + '/' + parts[i] + '/'
			});
		} else {
			breadcrumbs.push({
				name: decodeURIComponent(parts[i]),
				url: breadcrumbs[i - 1].url + parts[i] + '/'
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
const element = computed(function () {
	if (this.noLink !== undefined) {
		return 'span';
	}

	return 'router-link';
});
</script>
