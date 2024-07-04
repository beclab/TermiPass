<template>
	<div class="file-footer" v-if="store.req">
		{{ selectFileCount || '' }}
		{{
			selectFileCount === 1
				? `item selected (${format.humanStorageSize(selectFileSize)}), `
				: selectFileCount > 1
				? `items selected (${format.humanStorageSize(selectFileSize)}), `
				: ''
		}}
		{{ totalFileCount }}
		{{ totalFileCount > 1 ? 'items' : 'item' }}
	</div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { format } from 'quasar';
import { useRoute } from 'vue-router';
import { useDataStore } from '../../../stores/data';

const store = useDataStore();
const route = useRoute();

const selectFileCount = ref(0);
const selectFileSize = ref(0);
const totalFileCount = ref(0);

watch(
	() => store.selected,
	async (newVaule) => {
		selectFileCount.value = store.selectedCount;
		let totalSize = 0;
		if (store.selectedCount && newVaule.length > 0) {
			for (let i = 0; i < newVaule.length; i++) {
				const el = newVaule[i];

				let filesSize: number = store.req.items[el].size || 0;
				totalSize += filesSize;
			}
		}

		selectFileSize.value = totalSize;
	},
	{
		deep: true
	}
);

watch(
	() => store.req,
	(newVal) => {
		if (newVal) {
			totalFileCount.value =
				newVal.items && newVal.items.length > 0 ? newVal.items.length : 0;
		}
	}
);
</script>

<style scoped lang="scss">
.file-footer {
	width: 100%;
	height: 40px;
	line-height: 40px;
	text-align: center;
	border-top: 1px solid $separator;
	justify-content: center !important;
}
</style>
