<template>
	<q-drawer
		show-if-above
		behavior="desktop"
		height="100%"
		:width="72"
		side="right"
		style="background: transparent"
	>
		<q-scroll-area
			style="height: 100%; width: 100%"
			:thumb-style="scrollBarStyle.thumbStyle"
		>
			<q-list class="pluginDrawer column items-center justify-center">
				<div clickable class="menu-scale">
					<q-icon
						name="sym_r_right_panel_close"
						size="20px"
						@click="toggleBex"
					/>
				</div>

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
							class="item-text q-mt-sm text-body3"
							:class="menu.label == activeItem ? 'text-grey-10' : 'text-grey-6'"
						>
							{{ menu.label }}
						</div>
					</div>
				</template>

				<div class="menu-footer column items-center justify-center">
					<!-- <q-icon
						name="sym_o_settings"
						size="24px"
						class="cursor-pointer settings"
						@click="showSettings"
					/> -->

					<TerminusAvatar
						class="avatar-circle"
						:info="userStore.terminusInfo()"
						:size="28"
						@click="showSettings"
					/>
				</div>
			</q-list>
		</q-scroll-area>
	</q-drawer>
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
		identify: 'rss',
		label: 'Collect'
	},
	{
		icon: 'sym_r_apps',
		identify: 'read',
		label: 'Read'
	},
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
	margin-top: 28px;
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
	padding: 12px 0;
}

.menu-footer {
	position: absolute;
	bottom: 32px;

	.settings {
		margin-bottom: 20px;
	}
}
</style>
