<template>
	<q-menu
		@update:model-value="showPopupProxy"
		class="popup-menu bg-background-2"
	>
		<q-list dense padding>
			<q-item
				class="row items-center justify-start text-ink-2 popup-item"
				clickable
				v-close-popup
				v-for="item in menuList"
				:key="item.name"
				@click="handleEvent(item.action, $event)"
			>
				<q-icon :name="item.icon" size="20px" class="q-mr-sm" />
				<q-item-section class="menuName">
					{{ item.name }}
				</q-item-section>
			</q-item>
		</q-list>
	</q-menu>
</template>
<script lang="ts" setup>
import { useQuasar } from 'quasar';
import { useRoute } from 'vue-router';
import { seahub, sync as syncFile } from '../../../api';
import { popupMenu, OPERATE_ACTION } from '../../../utils/contact';
import { useDataStore } from '../../../stores/data';
import { useMenuStore } from '../../../stores/files-menu';
import { handleFileOperate } from '../files/OperateAction';
import ReName from './ReName.vue';
import DeleteRepo from './DeleteRepo.vue';
import SyncInfo from './SyncInfo.vue';

import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
	item: {
		type: Object,
		required: false
	},
	from: {
		type: String,
		require: false,
		default: ''
	},
	isSide: {
		type: Boolean,
		require: false,
		default: false
	}
});

const $q = useQuasar();
const dataStore = useDataStore();
const route = useRoute();

const emits = defineEmits(['showPopupProxy']);

const { t } = useI18n();

const showPopupProxy = (value: boolean) => {
	if (value) {
		onBeforeShow();
	}

	emits('showPopupProxy', value);
};

const menuStore = useMenuStore();

const menuList = ref<any[]>([]);
const isElectron = ref($q.platform.is.electron);

const onBeforeShow = async () => {
	if (props.item && props.item.repo_id) {
		if (props.isSide && isElectron.value) {
			await sideElectronMenu();
		} else {
			await noLocalMenu();
		}

		await checkShardUser();
	} else {
		onBeforeShowDrive();
	}
};

const onBeforeShowDrive = () => {
	menuList.value = popupMenu.filter((e) => {
		return (
			(e.name === 'Rename' &&
				dataStore.selected &&
				dataStore.selected.length > 0) ||
			(e.name === 'Delete' &&
				dataStore.selected &&
				dataStore.selected.length > 0) ||
			e.name === 'Attributes'
		);
	});
};

const sideElectronMenu = () => {
	const status = menuStore.syncReposLastStatusMap[props.item?.repo_id]
		? menuStore.syncReposLastStatusMap[props.item?.repo_id].status
		: 0;

	if (status == 0) {
		menuList.value = popupMenu.filter(
			(e) => e.requiredSync == undefined || e.requiredSync == false
		);
	} else {
		menuList.value = popupMenu.filter(
			(e) => e.requiredSync == undefined || e.requiredSync == true
		);
	}
};

const noLocalMenu = () => {
	menuList.value = popupMenu.filter((e) => e.requiredSync == undefined);
};

const checkShardUser = () => {
	let selfMenuList = JSON.parse(JSON.stringify(menuList.value));
	let newMenuList: any[] = [];

	for (let i = 0; i < selfMenuList.length; i++) {
		const slef = selfMenuList[i];
		if (
			slef.action === OPERATE_ACTION.SHARE_WITH &&
			props.item?.type &&
			props.item.type === 'shared'
		) {
			continue;
		}

		if (
			slef.action === OPERATE_ACTION.EXIT_SHARING &&
			props.item?.type &&
			props.item.type === 'mine'
		) {
			continue;
		}

		if (
			slef.action === OPERATE_ACTION.RENAME &&
			props.item?.type &&
			props.item.type === 'shared'
		) {
			continue;
		}

		if (
			slef.action === OPERATE_ACTION.DELETE &&
			props.item?.type &&
			props.item.type === 'shared'
		) {
			continue;
		}

		newMenuList.push(slef);
	}

	menuList.value = newMenuList;

	// if (props.item?.shard_user_hide_flag) {
	// 	menuList.value = menuList.value.filter(
	// 		(cell) => cell.name !== 'Exit Sharing'
	// 	);
	// }
};

const handleEvent = async (action: OPERATE_ACTION, e: any) => {
	const path = '/';
	switch (action) {
		case OPERATE_ACTION.SHARE_WITH:
			dataStore.showHover('share-dialog');
			menuStore.shareRepoInfo = props.item;
			menuStore.shareRepoInfo.path = path;
			break;
		case OPERATE_ACTION.OPEN_LOCAL_SYNC_FOLDER:
			if ($q.platform.is.electron && props.item) {
				window.electron.api.files.openLocalRepo(props.item.id);
			}
			break;
		case OPERATE_ACTION.SYNCHRONIZE_TO_LOCAL:
			dataStore.resetSelected();
			dataStore.addSelected(props.item);
			dataStore.showHover('sync-select-save-path');
			break;
		case OPERATE_ACTION.UNSYNCHRONIZE:
			if ($q.platform.is.electron && props.item) {
				window.electron.api.files.repoRemoveSync(props.item.id);
			}
			break;
		case OPERATE_ACTION.SYNC_IMMEDIATELY:
			if ($q.platform.is.electron && props.item) {
				window.electron.api.files.syncRepoImmediately(props.item.id);
			}
			break;

		case OPERATE_ACTION.RENAME:
			showRename(e);
			break;

		case OPERATE_ACTION.DELETE:
			deleteRepo(e);
			break;

		case OPERATE_ACTION.ATTRIBUTES:
			// dataStore.showHover('info');
			syncRepoInfo(e);

			break;

		case OPERATE_ACTION.EXIT_SHARING:
			deleteShareRepo();
			break;

		default:
			break;
	}
};

const showRename = (e: any) => {
	if (props.from === 'sync') {
		$q.dialog({
			component: ReName,
			componentProps: {
				item: props.item
			}
		});
	} else {
		handleFileOperate(
			e,
			route,
			OPERATE_ACTION.RENAME,
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			async (_action: OPERATE_ACTION, _data: any) => {
				//Do nothing
				dataStore.closeHovers();
			}
		);
	}
};

const deleteRepo = async (e: any) => {
	if (props.from === 'sync') {
		try {
			const res = await syncFile.getShareInfo(props.item?.repo_id);
			const shared_user_emails_length = res.shared_user_emails.length || 0;

			$q.dialog({
				component: DeleteRepo,
				componentProps: {
					item: props.item,
					shared_length: shared_user_emails_length
				}
			}).onOk(async () => {
				const path = `seahub/api/v2.1/repos/${props.item?.repo_id}/`;
				await seahub.deleteRepo(path);
				syncFile.getSyncMenu();
			});
		} catch (error) {
			return false;
		}
	} else {
		handleFileOperate(
			e,
			route,
			OPERATE_ACTION.DELETE,
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			async (_action: OPERATE_ACTION, _data: any) => {
				dataStore.closeHovers();
			}
		);
	}
};

const syncRepoInfo = (e) => {
	if (props.from === 'sync') {
		try {
			$q.dialog({
				component: SyncInfo,
				componentProps: {
					item: props.item
				}
			}).onOk(async () => {
				console.log('ok');
			});
		} catch (error) {
			return false;
		}
	} else {
		handleFileOperate(
			e,
			route,
			OPERATE_ACTION.DELETE,
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			async (_action: OPERATE_ACTION, _data: any) => {
				dataStore.closeHovers();
			}
		);
	}
};

const deleteShareRepo = async () => {
	try {
		$q.dialog({
			title: t('files_popup_menu.exit_sharing'),
			message: t('exit_sharing_message')
		}).onOk(async () => {
			const path = `seahub/api/v2.1/shared-repos/${props.item?.repo_id}/?share_type=${props.item?.share_type}&user=${props.item?.user_email}`;
			await seahub.deleteRepo(path);
			syncFile.getSyncMenu();
		});
	} catch (error) {
		return false;
	}
};
</script>
<style lang="scss" scoped>
.popup-item {
	border-radius: 4px;
}
.menuName {
	white-space: nowrap;
}
</style>
