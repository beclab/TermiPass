<template>
	<q-dialog
		ref="dialogRef"
		position="bottom"
		transition-show="jump-up"
		transition-hide="jump-down"
		transition-duration="300"
	>
		<terminus-dialog-display-content title="Sort" :dialog-ref="dialogRef">
			<template v-slot:content>
				<q-list class="list">
					<q-item
						v-for="sort in sortTypes"
						:key="sort"
						class="q-mb-sm list-item row items-center justify-between"
						clickable
						v-ripple
						bordered
						style="height: 44px"
						@click="fileSort(sort)"
					>
						<div class="col5 row items-center justify-between">
							<q-icon
								:name="filesSortTypeInfo[sort].icon"
								size="20px"
								color="grey-8"
							/>
							<div class="q-mx-xs text-subtitle2 sort-title">
								{{ filesSortTypeInfo[sort].name }}
							</div>
							<div class="q-mx-xs text-body2 sort-detail">
								{{
									dataStore.activeSort.by === sort
										? dataStore.activeSort.asc
											? filesSortTypeInfo[sort].introduce.asc
											: filesSortTypeInfo[sort].introduce.desc
										: filesSortTypeInfo[sort].introduce.asc
								}}
							</div>
						</div>
						<div class="col row items-center justify-end">
							<q-icon
								v-if="dataStore.activeSort.by === sort"
								name="sym_r_check"
								size="20px"
								color="grey-8"
							/>
						</div>
					</q-item>
				</q-list>
			</template>
		</terminus-dialog-display-content>
	</q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar';
import { ref } from 'vue';
import { FilesSortType, filesSortTypeInfo } from '../../../utils/contact';
import { useDataStore } from '../../../stores/data';
import TerminusDialogDisplayContent from '../../../components/common/TerminusDialogDisplayContent.vue';
const { dialogRef, onDialogOK } = useDialogPluginComponent();

const sortTypes = ref([
	FilesSortType.NAME,
	FilesSortType.SIZE,
	FilesSortType.TYPE,
	FilesSortType.Modified
]);

const dataStore = useDataStore();

function fileSort(sort: FilesSortType) {
	if (dataStore.activeSort.by == sort) {
		dataStore.updateActiveSort(sort, !dataStore.activeSort.asc);
	} else {
		dataStore.updateActiveSort(sort, true);
	}

	onDialogOK();
}
</script>

<style lang="scss" scoped>
.sort-title {
	color: $ink-1;
}

.sort-detail {
	color: $ink-2;
}
</style>
