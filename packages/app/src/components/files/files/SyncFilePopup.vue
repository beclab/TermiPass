<template>
	<q-menu class="menu">
		<q-list style="margin: 8px">
			<file-operation-item icon="sym_r_move_up" label="Move" />
			<file-operation-item
				icon="sym_r_content_copy"
				label="Copy"
				:action="OPERATE_ACTION.COPY"
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
				icon="sym_r_browser_updated"
				label="Download"
				:action="OPERATE_ACTION.DOWNLOAD"
			/>
			<file-operation-item
				icon="sym_r_share_windows"
				label="Share"
				:action="OPERATE_ACTION.SHARE"
			/>
			<file-operation-item icon="sym_r_edit_link" label="Link Sharing" />
			<file-operation-item icon="sym_r_history" label="Version History" />
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
import { OPERATE_ACTION } from '../../../utils/contact';
</script>

<style scoped lang="scss">
.menu {
	width: 151px;
	box-shadow: 0 4px 10px 0 $grey-2;
	border-radius: 8px;
	padding: 8px;
}
</style>
