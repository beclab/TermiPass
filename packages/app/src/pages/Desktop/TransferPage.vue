<template>
	<div class="transer-page-root">
		<q-table
			flat
			:rows="transferStore.datas"
			:columns="columns"
			row-key="id"
			selection="multiple"
			v-model:selected="transferStore.selectList"
			hide-pagination
			hide-selected-banner
			hide-bottom
		>
			<template v-slot:header-selection="scope">
				<div
					class="select-box row items-center justify-center"
					:style="{
						background: `${scope.selected ? 'yellow' : 'white'}`,
						border: `${scope.selected ? '0' : '1px solid #E0E0E0'}`
					}"
				>
					<q-checkbox
						dense
						v-model="scope.selected"
						checked-icon="sym_r_check_small"
						unchecked-icon=""
						size="lg"
						color="black"
						:style="{ opacity: `${scope.selected ? 1 : 0}` }"
					/>
				</div>
			</template>

			<template v-slot:body-selection="scope">
				<div
					class="select-box row items-center justify-center"
					:style="{
						background: `${scope.selected ? 'yellow' : 'white'}`,
						border: `${scope.selected ? '0' : '1px solid #E0E0E0'}`
					}"
				>
					<q-checkbox
						dense
						v-model="scope.selected"
						checked-icon="sym_r_check_small"
						unchecked-icon=""
						size="lg"
						color="black"
						:style="{ opacity: `${scope.selected ? 1 : 0}` }"
					/>
				</div>
			</template>

			<template v-slot:body-cell-fileName="props">
				<q-td :props="props">
					<div class="row items-center props_name_normal">
						<img class="q-mr-sm" :src="fileIcon(props.row.fileName)" />
						<div
							style="
								width: calc(100% - 40px);
								overflow: hidden;
								white-space: nowrap;
								text-overflow: ellipsis;
							"
						>
							{{ props.row.fileName }}
						</div>
					</div>
				</q-td>
			</template>

			<template v-slot:body-cell-status="props">
				<q-td :props="props">
					<div v-if="transferStore.activeItem != MenuType.Complete">
						<q-linear-progress
							stripe
							rounded
							size="5px"
							:value="props.row.progress"
							class="q-mb-sm"
							color="green"
						/>
						<div class="row items-center justify-between">
							<div
								class="text-blue"
								style="
									width: 50%;
									text-align: left;
									overflow: hidden;
									white-space: nowrap;
									text-overflow: ellipsis;
								"
							>
								{{ transferStore.formatFileSize(props.row.speed) }}
								/s
							</div>
							<div
								class="text-grey-5"
								style="
									width: 50%;
									overflow: hidden;
									white-space: nowrap;
									text-overflow: ellipsis;
								"
							>
								{{ transferStore.formatLeftTimes(props.row.leftTimes) }}
							</div>
						</div>
					</div>
					<div v-else>
						<div class="row items-center justify-end">
							<div
								class="q-mr-sm"
								style="
									width: calc(100% - 30px);
									overflow: hidden;
									white-space: nowrap;
									text-overflow: ellipsis;
								"
							>
								{{ formatStampTime(props.row.endTime) }}
							</div>
							<q-icon
								:name="props.row.isUpload ? 'sym_r_download' : 'sym_r_upload'"
								color="blue"
								size="20px"
							/>
						</div>
					</div>
				</q-td>
			</template>

			<template v-slot:body-cell-actions="props">
				<q-td :props="props" class="text-grey-8">
					<div v-if="transferStore.activeItem != MenuType.Complete">
						<q-icon
							:name="
								props.row.paused ? 'sym_r_play_circle' : 'sym_r_pause_circle'
							"
							size="20px"
							class="q-mr-sm"
							@click.stop="pauseOrResumeAction(props.row)"
						/>
						<q-icon
							name="sym_r_delete"
							size="20px"
							class="q-mr-sm"
							@click.stop="deleteItem(props.row)"
						/>
						<q-icon
							name="sym_r_search"
							size="20px"
							@click.stop="openItem(props.row)"
						/>
					</div>
					<div v-else>
						<q-icon
							name="sym_r_search"
							size="20px"
							class="q-mr-sm"
							@click.stop="openItem(props.row)"
						/>
						<q-icon
							name="sym_r_delete"
							size="20px"
							@click.stop="deleteItem(props.row)"
						/>
					</div>
				</q-td>
			</template>
		</q-table>
		<div
			class="empty column items-center justify-center"
			v-if="transferStore.datas.length == 0"
		>
			<img src="../../assets/images/empty.png" alt="empty" />
			<span class="text-body2">{{ $t('files.lonely') }}</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useTransferStore, MenuType } from '../../stores/transfer';
import { useQuasar } from 'quasar';
import { getFileType, formatStampTime } from '../../utils/utils';

const transferStore = useTransferStore();

const $q = useQuasar();

const columns = [
	{
		name: 'fileName',
		required: true,
		label: 'File Name',
		align: 'left',
		field: (row: { name: any }) => row.name,
		format: (val: any) => `${val}`,
		sortable: false
	},
	{
		name: 'Size',
		label: 'Size',
		align: 'center',
		field: (row: any) => {
			return transferStore.activeItem == MenuType.Complete
				? [row.totalBytes]
				: [row.receivedBytes ? row.receivedBytes : 0, row.totalBytes];
		},
		format: (val: any) => {
			return val.length == 1
				? `${transferStore.formatFileSize(val[0])}`
				: `${transferStore.formatFileSize(
						val[0]
				  )}/${transferStore.formatFileSize(val[1])}`;
		},
		sortable: false
	},
	{
		name: 'status',
		label: 'Status',
		field: 'progress',
		sortable: false,
		align: 'right'
	},
	{
		name: 'actions',
		label: 'Actions',
		field: 'carbs',
		align: 'right'
	}
];

const pauseOrResumeAction = (item: any) => {
	console.log('');
	if (item.front == 1 && $q.platform.is.electron) {
		window.electron.api.download.allPauseOrResume(!item.paused, [item.id]);
	}
};

const fileIcon = (name: any) => {
	let src = '/img/file-';
	let folderSrc = '/img/folder-default.svg';

	if (process.env.PLATFORM == 'DESKTOP') {
		src = './img/file-';
		folderSrc = './img/folder-default.svg';
	}

	if (name.split('.').length > 1) {
		src = src + getFileType(name) + '.svg';
	} else {
		src = folderSrc;
	}

	return src;
};

const deleteItem = async (item: any) => {
	if (transferStore.activeItem == MenuType.Download) {
		if (item.front == 1 && $q.platform.is.electron) {
			await window.electron.api.download.removeAllDownloadItems([item.id]);
		}
	} else if (transferStore.activeItem == MenuType.Complete) {
		if ($q.platform.is.electron) {
			await window.electron.api.transfer.clearCompleteData([item.id]);
		}
	}
	transferStore.refreshData();
};

const openItem = (item: any) => {
	if ($q.platform.is.electron) {
		window.electron.api.transfer.openFileInFolder(item.to);
	}
};
</script>

<style lang="scss">
.transer-page-root {
	background: $white;
	height: 100%;

	.select-box {
		width: 24px;
		height: 24px;
		border-radius: 4px;
		box-sizing: border-box;
	}

	.empty {
		width: 100%;
		height: calc(100% - 80px);

		img {
			width: 226px;
			height: 170px;
			margin-bottom: 20px;
		}

		span {
			color: $grey-14;
		}
	}
}
</style>
