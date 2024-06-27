<template>
	<q-dialog class="card-dialog" ref="dialogRef" v-model="show" @hide="onCancel">
		<q-card class="card-continer" flat>
			<terminus-dialog-bar
				:label="t('files.attributes')"
				icon=""
				titAlign="text-left"
				@close="onCancel"
			/>

			<div
				class="dialog-desc"
				:style="{ textAlign: isMobile ? 'center' : 'left' }"
			>
				<div class="title-module row justify-start items-center">
					<terminus-file-icon
						class="q-mr-md"
						:name="name"
						:type="fileType"
						:read-only="readOnly"
						:is-dir="isDir"
						style=""
					/>
					<div class="column justify-center" style="width: calc(100% - 50px)">
						<div class="title text-ink-1 text-subtitle3 q-mb-xs">
							{{ name }}
						</div>
						<div class="detail text-ink-3 text-body3">{{ modified }}</div>
					</div>
				</div>

				<q-skeleton style="height: 1px" color="grey-5" />

				<div class="info-module column items-center">
					<div class="info-item row justify-between items-center">
						<span class="title text-ink-3 text-body3">{{
							t('files.style')
						}}</span>
						<span class="detail text-ink-1 text-body3">{{ fileType }}</span>
					</div>
					<div class="info-item row justify-between items-center">
						<span class="title text-ink-3 text-body3">{{
							t('files.path')
						}}</span>
						<span class="detail text-ink-1 text-body3">{{ path }}</span>
					</div>
					<div class="info-item row justify-between items-center">
						<span class="title text-ink-3 text-body3">{{
							t('prompts.size')
						}}</span>
						<span class="detail text-ink-1 text-body3">{{ humanSize }} </span>
					</div>
					<div
						class="info-item row justify-between items-center"
						v-if="fileType === 'folder'"
					>
						<span class="title text-ink-3 text-body3">{{
							t('prompts.contain')
						}}</span>
						<span class="detail text-ink-1 text-body3">
							{{ humanNumber }}
						</span>
					</div>
					<div class="info-item row justify-between items-center">
						<span class="title text-ink-3 text-body3">{{
							t('files.update_time')
						}}</span>
						<span class="detail text-ink-1 text-body3">{{ modified }}</span>
					</div>
				</div>
			</div>
		</q-card>
	</q-dialog>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { format, useDialogPluginComponent, useQuasar } from 'quasar';
import { useDataStore } from 'src/stores/data';
import TerminusFileIcon from '../../common/TerminusFileIcon.vue';
import { formatFileModified } from 'src/utils/file';
import { useI18n } from 'vue-i18n';

import TerminusDialogBar from '../../common/TerminusDialogBar.vue';
// import TerminusDialogFooter from '../../common/TerminusDialogFooter.vue';

const { dialogRef } = useDialogPluginComponent();

const $q = useQuasar();
const isMobile = ref(process.env.PLATFORM == 'MOBILE' || $q.platform.is.mobile);

const { humanStorageSize } = format;

const { t } = useI18n();
const show = ref(true);

const store = useDataStore();

const humanSize = computed(function () {
	if (fileType.value === 'folder') {
		return '-';
	}

	if (store.selectedCount === 0) {
		return humanStorageSize(store.req.size);
	}

	let sum = 0;

	for (let selected of store.selected) {
		sum += store.req.items[selected].size;
	}

	return humanStorageSize(sum);
});

const humanNumber = computed(function () {
	return '-';
	// if (store.selectedCount === 0) {
	// 	return 0;
	// }
	// const item = store.req.items[store.selected[0]];
	// let folder = `${item.numDirs} ${item.numDirs > 1 ? 'folders, ' : 'folder, '}`;
	// let file = `${item.numFiles} ${item.numFiles > 1 ? 'files' : 'file'}`;

	// return `${item.numDirs > 0 ? folder : ''} ${file}`;
});

const name = computed(function () {
	return store.selectedCount === 0
		? store.req.name
		: store.req.items[store.selected[0]].name;
});

const modified = computed(function () {
	return formatFileModified(
		store.selectedCount === 0
			? store.req.modified
			: store.req.items[store.selected[0]].modified
	);
});

const fileType = computed(function () {
	return store.selectedCount === 0
		? store.req.isDir
			? 'folder'
			: store.req.type
		: store.req.items[store.selected[0]].isDir
		? 'folder'
		: store.req.items[store.selected[0]].type;
});

const isDir = computed(function () {
	return store.selectedCount === 0
		? (store.req.isDir as boolean)
		: (store.req.items[store.selected[0]].isDir as boolean);
});

const readOnly = computed(function () {
	return store.selectedCount === 0
		? store.req.readOnly
		: store.req.items[store.selected[0]].readOnly;
});

const path = computed(function () {
	const path =
		store.selectedCount === 0
			? store.req.path
			: store.req.items[store.selected[0]].path;

	if (path.startsWith('/Seahub')) {
		return path.slice(7);
	} else {
		return path;
	}
});

const onCancel = () => {
	store.closeHovers();
};
</script>

<style lang="scss" scoped>
.card-dialog {
	.card-continer {
		width: 400px;
		border-radius: 12px;

		.dialog-desc {
			padding: 0 20px 20px 20px;
			.title-module {
				margin-top: 20px;
				margin-bottom: 20px;
				.detail {
					text-align: left;
					color: $sub-title;
					max-width: 100%;
					width: 100%;

					text-overflow: ellipsis;
					white-space: nowrap;
					overflow: hidden;
				}
				.title {
					text-align: left;
				}
			}

			.info-module {
				margin-top: 8px;
				margin-bottom: 12px;

				.info-item {
					width: 100%;
					margin-top: 12px;

					.title {
						text-align: left;
						color: $prompt-message;
						width: 100px;

						text-overflow: ellipsis;
						white-space: nowrap;
						overflow: hidden;
					}

					.detail {
						text-align: left;
						color: $title;
						flex: 1;

						text-overflow: ellipsis;
						white-space: nowrap;
						overflow: hidden;
					}
				}
			}
		}
	}
}
</style>
