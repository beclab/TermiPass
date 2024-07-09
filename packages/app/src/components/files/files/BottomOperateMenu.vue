<template>
	<q-scroll-area
		class="bottom-menu-list"
		:thumb-style="contentStyle as any"
		:visible="true"
		content-style="height: 100%;"
	>
		<q-card-section
			horizontal
			class="row items-center justify-center text-ink-3"
			style="height: 48px"
		>
			<template v-for="(item, index) in filteredContextmenuMenu" :key="index">
				<file-operation-item
					:icon="item.icon"
					:label="item.name"
					:action="item.action"
					@on-item-click="onItemClick"
					@hide-menu="hideMenu"
				/>
			</template>
		</q-card-section>
	</q-scroll-area>

	<!-- </q-list> -->
</template>

<script setup lang="ts">
import { defineEmits, defineProps, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useDataStore } from '../../../stores/data';
import { useQuasar } from 'quasar';
import { useMenuStore } from '../../../stores/files-menu';
import { SYNC_STATE, OPERATE_ACTION } from '../../../utils/contact';
import { notifySuccess } from '../../../utils/notifyRedefinedUtil';
import { useI18n } from 'vue-i18n';
import FileOperationItem from './FileOperationItem.vue';
import { useOperateinStore } from '../../../stores/operation';
import { computed } from 'vue';
import { reactive } from 'vue';
import { EventType, OriginType } from '../../../api/common/encoding';
import { containsSameValue } from '../../../utils/utils';

const props = defineProps({
	menuList: Object,
	isCopy: Boolean
});

const Route = useRoute();
const dataStore = useDataStore();
const menuStore = useMenuStore();

const emit = defineEmits(['changeVisible']);
// const menuListSelf = ref<any[]>([]);
const { t } = useI18n();

const $q = useQuasar();

const operateinStore = useOperateinStore();

const eventType = reactive<EventType>({
	type: undefined,
	isSelected: false, //	true: Right click on a item; false: Right click on a blank area on the files
	hasCopied: false,
	showRename: true,
	isHomePage: false
});

const filteredContextmenuMenu = computed(() => {
	return operateinStore.contextmenu.filter((item) => item.condition(eventType));
});

watch(
	() => props.menuList,
	() => {
		reloadMenus();
	},
	{
		deep: true
	}
);

const reloadMenus = () => {
	// let result: any = [];
	if (props.isCopy) {
		const hasCopy = dataStore.copyFiles && dataStore.copyFiles.items.length;
		eventType.hasCopied = hasCopy;
	} else if (props.menuList) {
		eventType.isSelected = true;
		dataStore.resetSelectedByValue(props.menuList);
		filterItem(props.menuList[0]);
	}

	// const items: any = [];
	// for (let index = 0; index < result.length; index++) {
	// 	const item = result[index];
	// 	if (showDisabled(item)) {
	// 		items.push(item);
	// 	}
	// }
	// console.log('items ++++');
	// console.log(items);

	// menuListSelf.value = items;
};

const filterItem = (item: any) => {
	if (dataStore.selectedCount > 1) {
		eventType.showRename = false;
	} else {
		eventType.showRename = true;
	}

	if (item.type === OriginType.SYNC) {
		const repo_id = Route.query.id?.toString();
		if (repo_id) {
			const status = menuStore.syncReposLastStatusMap[repo_id]
				? menuStore.syncReposLastStatusMap[repo_id].status
				: 0;

			let statusFalg =
				status > SYNC_STATE.DISABLE && status != SYNC_STATE.UNKNOWN;
			if (dataStore.selectedCount === 1 && statusFalg) {
				eventType.type = OriginType.SYNC;
			} else {
				eventType.type = undefined;
			}
		} else {
			eventType.type = undefined;
		}
	}

	const hasSelected =
		dataStore?.req?.items &&
		dataStore?.req?.items.length > 0 &&
		dataStore.req.items.filter((_, index) =>
			dataStore.selected.includes(index)
		);
	const hasSameValue = containsSameValue(
		hasSelected,
		operateinStore.disableMenuItem,
		'name'
	);

	if (hasSameValue) {
		eventType.isHomePage = true;
	} else {
		eventType.isHomePage = false;
	}
};

const hideMenu = () => {
	emit('changeVisible');
};

reloadMenus();

const contentStyle = ref({
	height: 0
});

const onItemClick = async (action: any, data: any) => {
	if (action == OPERATE_ACTION.COPY) {
		notifySuccess(t('copy_success'));
		dataStore.resetMutilSelected();
	} else if (action == OPERATE_ACTION.PASTE) {
		dataStore.resetMutilSelected();
		dataStore.resetCopyFiles();
	} else if (action == OPERATE_ACTION.OPEN_LOCAL_SYNC_FOLDER) {
		const repo_id = Route.query.id as string;
		const isElectron = $q.platform.is.electron;
		if (isElectron) {
			window.electron.api.files.openLocalRepo(repo_id, data);
		}
	}
};
</script>

<style scoped lang="scss">
.bottom-menu-list {
	width: 100%;
	height: 100%;
	// background-color: red;
	.menu-item {
		// width: 100%;
		min-width: 120px;
		border-radius: 5px;
		// background-color: green;
		min-height: 36px !important;
		padding-left: 8px !important;
		padding-right: 2px !important;
		padding-top: 2px !important;
		padding-bottom: 2px !important;

		&:hover {
			background-color: $background-hover;
		}
	}
}
</style>
