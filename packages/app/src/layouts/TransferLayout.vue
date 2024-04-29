<template>
	<q-layout view="lHh LpR lFr" :container="true">
		<q-header class="layoutHeader row items-center justify-between">
			<div
				class="row items-center justify-start ellipsis text-grey-9 text-weight-medium"
				style="flex: 1"
			>
				<q-icon class="q-mr-sm" name="sym_r_cloud_download" size="24px" />
				{{ transferStore.menus[0].children[transferStore.activeItem].label }}
			</div>

			<div class="row items-center justify-end">
				<div
					class="upload-btn text-body3 q-mr-sm"
					v-if="transferStore.activeItem != MenuType.Complete"
					@click="pauseAction"
					:style="{
						pointerEvents: `${!pauseEnable ? 'none' : 'auto'}`,
						opacity: `${!pauseEnable ? 0.7 : 1}`
					}"
				>
					<q-icon class="q-mr-xs" name="sym_r_pause_circle" size="20px" />
					{{ t('transmission.pause_all') }}
				</div>

				<div
					class="upload-btn text-body3 q-mr-sm"
					v-if="transferStore.activeItem != MenuType.Complete"
					@click="startAction"
					:style="{
						pointerEvents: `${!resumeEnable ? 'none' : 'auto'}`,
						opacity: `${!resumeEnable ? 0.7 : 1}`
					}"
				>
					<q-icon class="q-mr-xs" name="sym_r_play_circle" size="20px" />
					{{ t('transmission.all_Start') }}
				</div>

				<div class="upload-btn text-body3 q-mr-sm" @click="clearAction">
					<q-icon class="q-mr-xs" name="sym_r_delete" size="20px" />
					{{
						transferStore.selectList.length > 0
							? t('delete')
							: t('transmission.all_clear')
					}}
				</div>
			</div>
		</q-header>
		<TransferDrawer />
		<q-page-container>
			<q-page
				class="transfer-table"
				:class="
					$q.platform.is.win && $q.platform.is.electron
						? 'transfer-table-win'
						: 'transfer-table-common'
				"
			>
				<router-view />
			</q-page>
		</q-page-container>
	</q-layout>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { MenuType, useTransferStore } from '../stores/transfer';
import TransferDrawer from './TermipassLayout/TransferDrawer.vue';
import { watch } from 'vue';
import { useI18n } from 'vue-i18n';

const transferStore = useTransferStore();

const pauseEnable = ref(false);
const resumeEnable = ref(false);

const { t } = useI18n();

watch(
	() => transferStore.datas,
	() => {
		if (transferStore.datas.length == 0) {
			pauseEnable.value = false;
			resumeEnable.value = false;
		} else {
			if (transferStore.activeItem != MenuType.Complete) {
				pauseEnable.value =
					transferStore.datas.findIndex((e) => {
						return !(e as any).paused;
					}) >= 0;

				resumeEnable.value =
					transferStore.datas.findIndex((e) => {
						return (e as any).paused;
					}) >= 0;
			} else {
				pauseEnable.value = false;
				resumeEnable.value = false;
			}
		}
	},
	{
		immediate: true
	}
);

const clearAction = async () => {
	const ids = transferStore.selectList.map((e) => e.id);

	if (transferStore.activeItem == MenuType.Complete) {
		await window.electron.api.transfer.clearCompleteData(ids);
	} else if (transferStore.activeItem == MenuType.Download) {
		await window.electron.api.download.removeAllDownloadItems(ids);
	}
	transferStore.selectList = [];
	transferStore.refreshData();
};

const startAction = async () => {
	const ids = transferStore.selectList.map((e) => e.id);
	await window.electron.api.download.allPauseOrResume(false, ids);
};

const pauseAction = async () => {
	const ids = transferStore.selectList.map((e) => e.id);

	await window.electron.api.download.allPauseOrResume(true, ids);
	transferStore.refreshData();
};
</script>

<style lang="scss" scoped>
.layoutHeader {
	background-color: $white;
	color: $title;
	// padding: 20px 0px 10px 20px;
	height: 56px;
	padding: 0 20px;
}

.upload-btn {
	border: 1px solid $grey-2;
	padding: 6px 8px;
	border-radius: 8px;
	color: $sub-title;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
}

.transfer-table-common {
	height: calc(100vh - 73px) !important;
}

.transfer-table-win {
	height: calc(100vh - 95px) !important;
}
</style>
