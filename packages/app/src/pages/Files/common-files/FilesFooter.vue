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
import { useDataStore } from '../../../stores/data';
import { useFilesStore } from '../../../stores/files';

const store = useDataStore();
const filesStore = useFilesStore();

const selectFileCount = ref(0);
const selectFileSize = ref(0);
const totalFileCount = ref(0);

watch(
	() => filesStore.selected,
	async (newVaule) => {
		selectFileCount.value = filesStore.selectedCount;
		let totalSize = 0;
		if (filesStore.selectedCount && newVaule.length > 0) {
			for (let i = 0; i < newVaule.length; i++) {
				const el = newVaule[i];

				let filesSize: number = filesStore.currentFileList[el].size || 0;
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
	() => filesStore.currentFileList,
	(newVal) => {
		if (newVal) {
			totalFileCount.value = newVal && newVal.length > 0 ? newVal.length : 0;
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
