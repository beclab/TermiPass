<template>
	<div class="drawer-wrapper">
		<q-footer class="bg-white">
			<q-list class="pluginDrawer row items-center justify-around">
				<template v-for="(menu, index) in menus" :key="index">
					<div
						clickable
						class="column items-center justify-center menu-item"
						:class="menu.label === activeItem ? 'active-item' : ''"
						@click="handleItem(menu.label)"
					>
						<div class="icon-wrap row items-center justify-center">
							<img :src="showMenuIcon(menu.label)" />
						</div>
						<div
							class="item-text text-body3"
							:class="menu.label == activeItem ? 'text-grey-10' : 'text-grey-6'"
						>
							{{ menu.label }}
						</div>
					</div>
				</template>

				<div class="column items-center justify-center menu-item">
					<!-- <q-icon
						name="sym_o_settings"
						size="24px"
						class="cursor-pointer settings"
						@click="showSettings"
					/> -->

					<div class="icon-wrap row items-center justify-center">
						<TerminusAvatar
							class="avatar-circle"
							:info="userStore.terminusInfo()"
							:size="20"
							@click="showSettings"
						/>
					</div>
					<div class="item-text text-body3 text-grey-6">User</div>
				</div>
			</q-list>
		</q-footer>
	</div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { useMenuStore } from '../../stores/files-menu';
import { useUserStore } from '../../stores/user';
import { useRoute, useRouter } from 'vue-router';
import { getPluginImageUrl } from '../../stores/bex-url';

import { scrollBarStyle } from '../../utils/contact';
import { useBexStore } from '../../stores/bex';

const menuStore = useMenuStore();
const userStore = useUserStore();
const router = useRouter();
const route = useRoute();

const bexStore = useBexStore();

const menus = ref([
	{
		icon: 'sym_r_apps',
		identify: 'home',
		label: 'Chat'
	},
	{
		icon: 'sym_r_apps',
		identify: 'collect',
		label: 'Collect'
	},
	// {
	// 	icon: 'sym_r_apps',
	// 	identify: 'read',
	// 	label: 'Read'
	// },
	{
		icon: 'sym_r_apps',
		identify: 'vault',
		label: 'Vault'
	}
]);
const activeItem = ref<string | null>('Chat');

onMounted(async () => {
	menuStore.fifterMenu();
});

const showMenuIcon = (name: string) => {
	if (activeItem.value === name) {
		return getPluginImageUrl(`${name}-active.svg`);
	} else {
		return getPluginImageUrl(`${name}.svg`);
	}
};

const handleItem = (label: string) => {
	activeItem.value = label;
	switch (label) {
		case 'Chat':
			router.push({
				path: '/home'
			});
			break;

		case 'Vault':
			router.push({
				path: '/items'
			});
			break;
		case 'Collect':
			router.push({
				path: '/collect'
			});
			break;

		default:
			break;
	}
};

watch(
	() => route.meta,
	() => {
		if (!route.meta || !(route.meta as any).tabIdentify) {
			activeItem.value = '';
			return;
		}
		activeItem.value =
			menus.value.find((e) => e.identify === (route.meta as any).tabIdentify)
				?.label || '';
	},
	{
		immediate: true
	}
);

const showSettings = () => {
	router.push({
		path: '/setting'
	});
	activeItem.value = null;
};

const toggleBex = () => {
	bexStore.controller.toggleBexDisplay();
};
</script>

<style lang="scss">
.q-drawer {
	background-color: transparent;
}
</style>

<style lang="scss" scoped>
.menu-item {
	width: 56px;
	height: 64px;
	cursor: pointer;

	.icon-wrap {
		width: 40px;
		height: 40px;
		border-radius: 8px;

		img {
			width: 20px;
			height: 20px;
		}
	}
}

.active-item {
	.icon-wrap {
		background-color: $white;
	}

	.item-text {
		color: rgba(143, 143, 143, 1);
	}
}

.pluginDrawer {
	padding: 6px 0;
}

.menu-footer {
	// position: absolute;
	// bottom: 32px;
	border: 1px solid red;

	.settings {
		margin-bottom: 20px;
	}
}
.drawer-wrapper {
	& ::v-deep(.q-drawer) {
		background: transparent;
	}
}
</style>
