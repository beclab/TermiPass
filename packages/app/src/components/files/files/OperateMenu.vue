<template>
	<q-list
		dense
		class="menu-list text-ink-2 bg-background-2"
		v-if="visible"
		:style="{ top: top + 'px', left: left + 'px' }"
	>
		<template v-for="(item, index) in filteredContextmenuMenu" :key="index">
			<file-operation-item
				:icon="item.icon"
				:label="item.name"
				:action="item.action"
				@hide-menu="hideMenu"
			/>
		</template>
	</q-list>
</template>

<script setup lang="ts">
import { defineEmits, defineProps, ref, watch, computed, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
// import { useDataStore } from '../../../stores/data';
import { useQuasar } from 'quasar';
import { useMenuStore } from '../../../stores/files-menu';
import { SYNC_STATE } from '../../../utils/contact';
import { containsSameValue } from '../../../utils/utils';
import { useOperateinStore } from './../../../stores/operation';
import FileOperationItem from './FileOperationItem.vue';

import { useFilesStore, DriveType } from '../../../stores/files';
import { EventType } from '../../../stores/operation';

const props = defineProps({
	clientX: Number,
	clientY: {
		type: Number,
		default: 0,
		required: true
	},
	offsetRight: Number,
	offsetBottom: Number,
	menuVisible: Boolean,
	menuList: Object
});

const Route = useRoute();
const Router = useRouter();
// const dataStore = useDataStore();
const menuStore = useMenuStore();
const operateinStore = useOperateinStore();
const filesStore = useFilesStore();

const emit = defineEmits(['changeVisible']);

const visible = ref(false);
const top = ref<number>(props.clientY!);
const left = ref<number>(props.clientX!);

const $q = useQuasar();

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
	() => [props.menuList, Route.query.type, Route.query.p],
	(newVal) => {
		if (newVal[0]) {
			eventType.isSelected = true;
			filterItem(newVal[0]);
		} else {
			eventType.isSelected = false;
		}

		const menuHeight = filteredContextmenuMenu.value.length * 36;
		if (props.offsetBottom && props.offsetBottom < menuHeight) {
			top.value = props.clientY - menuHeight;
		} else {
			top.value = props.clientY || 0;
		}
	}
);

watch(
	() => operateinStore.copyFiles,
	(newVaule) => {
		console.log('copyFilescopyFiles', newVaule);
		if (newVaule && newVaule.length > 0) {
			eventType.hasCopied = true;
		} else {
			eventType.hasCopied = false;
		}
	},
	{
		deep: true
	}
);

const filterItem = (item: any) => {
	if (filesStore.selectedCount > 1) {
		eventType.showRename = false;
	} else {
		eventType.showRename = true;
	}

	if (item.type === DriveType.Sync) {
		const repo_id = Route.query.id?.toString();
		if (repo_id) {
			const status = menuStore.syncReposLastStatusMap[repo_id]
				? menuStore.syncReposLastStatusMap[repo_id].status
				: 0;

			let statusFalg =
				status > SYNC_STATE.DISABLE && status != SYNC_STATE.UNKNOWN;
			if (filesStore.selectedCount === 1 && statusFalg) {
				eventType.type = DriveType.Sync;
			} else {
				eventType.type = undefined;
			}
		} else {
			eventType.type = undefined;
		}
	}

	const hasSelected = filesStore.currentFileList.filter((_, index) => {
		return filesStore.selected.includes(index);
	});

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

watch(
	() => props.clientX,
	(newVaule) => {
		if (props.offsetRight && props.offsetRight < 144) {
			left.value = (newVaule as number) - 144;
		} else {
			left.value = newVaule || 0;
		}
	}
);
watch(
	() => props.clientY,
	(newVaule) => {
		const menuHeight = filteredContextmenuMenu.value.length * 36 + 10;
		if (props.offsetBottom && props.offsetBottom < menuHeight) {
			top.value = (newVaule as number) - menuHeight;
		} else {
			top.value = newVaule || 0;
		}
	}
);

watch(
	() => props.menuVisible,
	(newVaule) => {
		visible.value = newVaule;
	}
);

const hideMenu = () => {
	emit('changeVisible');
};
</script>

<style scoped lang="scss">
.menu-list {
	border-radius: 10px;
	cursor: pointer;
	padding: 5px 8px;
	position: fixed;
	z-index: 10;
	box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.2);

	.menu-item {
		width: 100%;
		border-radius: 5px;
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
