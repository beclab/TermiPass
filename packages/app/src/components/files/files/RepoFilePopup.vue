<template>
	<q-menu class="menu" @show="onShow" @hide="onHide">
		<q-list style="margin: 8px">
			<file-operation-item
				icon="sym_r_share_windows"
				label="Share"
				:action="OPERATE_ACTION.SHARE"
			/>
			<file-operation-item
				icon="sym_r_delete"
				label="Delete"
				:action="OPERATE_ACTION.DELETE"
			/>
			<file-operation-item
				icon="sym_r_edit_square"
				label="Rename"
				:action="OPERATE_ACTION.RENAME"
			/>
			<file-operation-item
				icon="sym_r_contract"
				label="Attributes"
				:action="OPERATE_ACTION.ATTRIBUTES"
			/>
		</q-list>
	</q-menu>
</template>

<script lang="ts" setup>
import FileOperationItem from './FileOperationItem.vue';
import { stopScrollMove } from '../../../utils/utils';
import { useDataStore } from '../../../stores/data';
import { OPERATE_ACTION } from '../../../utils/contact';

const store = useDataStore();

const props = defineProps({
	index: {
		type: Number,
		default: -1,
		required: true
	}
});

const onShow = () => {
	if (props.index && props.index !== -1) {
		stopScrollMove();
		if (store.selectedCount === 0) {
			store.addSelected(props.index);
			return;
		}
		if (store.selected.indexOf(props.index) === -1) {
			store.resetSelected();
			store.addSelected(props.index);
		}
	}
};

const onHide = () => {
	store.resetSelected();
};
</script>

<style scoped lang="scss">
.menu {
	width: 151px;
	box-shadow: 0 4px 10px 0 $grey-2;
	border-radius: 8px;
	padding: 8px;
}
</style>
