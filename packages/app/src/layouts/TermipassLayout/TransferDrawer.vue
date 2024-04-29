<template>
	<q-drawer
		show-if-above
		behavior="desktop"
		:width="240"
		:bordered="false"
		class="myDrawer"
	>
		<q-scroll-area
			style="height: 100%; width: 100%"
			:thumb-style="scrollBarStyle.thumbStyle"
		>
			<bt-menu
				:items="transferStore.menus"
				:default-active="`${transferStore.activeItem}`"
				@select="updateCurrentMenu"
				style="width: 100%"
				class="title-norla"
				active-class="files-active-link title-active"
			>
			</bt-menu>
		</q-scroll-area>
	</q-drawer>
</template>

<script lang="ts" setup>
import { useTransferStore } from '../../stores/transfer';
import { scrollBarStyle } from '../../utils/contact';

const transferStore = useTransferStore();

const updateCurrentMenu = (item: { key: string }) => {
	transferStore.selectList = [];
	transferStore.activeItem = Number(item.key);
	transferStore.refreshData();
};
</script>

<style lang="scss">
.files-active-link {
	color: rgba(31, 24, 20, 1);
	background: rgba(255, 235, 59, 0.1);
}

.myDrawer {
	background-color: $white;
	overflow: hidden;
	padding-top: 6px;
}
</style>
