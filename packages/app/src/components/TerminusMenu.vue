<template>
	<terminus-drag-node class="contain-bar q-px-sm">
		<div
			class="contain-header cursor-pointer"
			:style="
				$q.platform.is.electron && $q.platform.is.win ? '' : 'margin-top:24px;'
			"
			@dblclick.stop
		>
			<div class="avator">
				<TerminusAvatar
					v-if="current_user?.id"
					:info="userStore.terminusInfo()"
					:size="40"
				/>
			</div>
			<div class="userinfo q-ml-sm">
				<div class="text-subtitle1 text-ink-1 text-left">
					{{ current_user?.local_name }}
				</div>
				<div class="text-overline text-left row items-start">
					<TerminusUserStatus @super-action="showing = true" />
				</div>
			</div>
			<q-menu
				v-model="showing"
				:offset="[-52, -50]"
				style="border-radius: 12px"
			>
				<TerminusAdmin
					@switchAccount="handleSwitchAccount"
					@accountCenter="handleAccountCenter"
					@handleSettings="handleSettings"
				/>
			</q-menu>
		</div>

		<div class="contain-search q-mt-sm" ref="searchBox">
			<q-input
				dense
				readonly
				stack-label
				borderless
				class="search_itme"
				v-model="searchVal"
				color="ink-2"
				@click.stop
				@dblclick.stop
				debounce="500"
				@update:model-value="updateSearch"
				placeholder="Search"
				input-class="text-ink-1"
				input-style="color: rgba(92, 85, 81, 1); height: 30px !important; line-height: 30px;"
			>
				<template v-slot:prepend>
					<q-icon class="search_icon" name="search" size="16px" color="ink-2" />
				</template>
				<template v-slot:append>
					<q-icon
						v-if="searchVal"
						name="sym_r_cancel"
						color="ink-2"
						size="16px"
						@click="clearSearch"
						class="search_clean cursor-pointer"
					/>
					<span class="command">
						<q-icon
							v-if="!searchVal"
							name="sym_r_keyboard_command_key"
							color="ink-2"
							size="16px"
						/>
						<span v-if="!searchVal" class="text-overline text-body3 k"
							>+ K</span
						>
					</span>
				</template>
			</q-input>
		</div>

		<q-list class="menuList">
			<template v-for="menu in filterLayoutMenu" :key="menu.name">
				<q-item
					clickable
					v-ripple
					v-close-popup
					dense
					@dblclick.stop
					@click.stop="handleActive(menu)"
					:active="menu.identify === menuStore.terminusActiveMenu"
					class="row items-center justify-start q-px-md q-mb-xs q-py-none text-ink-1 text-body1"
					active-class="text-ink-1 bg-background-selected"
					style="border-radius: 8px; height: 32px"
				>
					<q-img
						class="q-mr-sm"
						style="width: 20px; height: 20px"
						:src="
							require(`../assets/layout/${
								menu.identify === menuStore.terminusActiveMenu
									? menu.icon_active
									: menu.icon
							}.svg`)
						"
					/>
					<div
						:class="
							menu.identify === menuStore.terminusActiveMenu
								? 'text-ink-1 text-subtitle2'
								: 'text-ink-2 text-body2'
						"
					>
						{{ menu.name }}
					</div>
				</q-item>
			</template>
		</q-list>
	</terminus-drag-node>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useMenuStore } from '../stores/menu';
import { useUserStore } from '../stores/user';
import { LayoutMenu, LayoutMenuIdetify } from '../utils/constants';

import TerminusAdmin from './TerminusAdmin.vue';
import SwitchAccount from './SwitchAccount.vue';
import TerminusDragNode from './common/TerminusDragNode.vue';
import TerminusUserStatus from './common/TerminusUserStatus.vue';

const $q = useQuasar();
const menuStore = useMenuStore();
const router = useRouter();
const userStore = useUserStore();
const filterLayoutMenu = ref(LayoutMenu);

const current_user = ref(userStore.current_user);
const searchVal = ref();

const updateSearch = (value: string) => {
	searchVal.value = value;
	filterLayoutMenu.value = fuzzySearch(value);
};

const fuzzySearch = (keyword) => {
	return LayoutMenu.filter((item) =>
		item.name.toLowerCase().includes(keyword.toLowerCase())
	);
};

const clearSearch = () => {
	searchVal.value = '';
	filterLayoutMenu.value = LayoutMenu;
};

const handleActive = (menu: {
	name: string;
	icon: string;
	icon_active: string;
	identify: string;
	path: string;
}) => {
	menuStore.pushTerminusMenuCache(menu.identify);

	if (menu.identify === LayoutMenuIdetify.VAULT) {
		menuStore.currentItem = 'All Vaults';
	}
	router.push({
		path: menu.path
	});
};

const handleSwitchAccount = () => {
	$q.dialog({
		component: SwitchAccount
	});
};

const handleAccountCenter = () => {
	menuStore.pushTerminusMenuCache(LayoutMenuIdetify.ACCOUNT_CENTER);
	router.push({
		path: '/accountCenter'
	});
};

const handleSettings = () => {
	menuStore.pushTerminusMenuCache(LayoutMenuIdetify.SYSTEM_SETTINGS);
	router.push({
		path: '/systemSettings'
	});
};

const showing = ref(false);
</script>

<style lang="scss" scoped>
.contain-bar {
	width: 180px;
	height: 100vh;
	text-align: center;
	position: relative;
	padding-top: 12px;

	.contain-bar-footer {
		background: $white;
		position: absolute;
		bottom: 0;
		border-radius: 8px;
	}

	.contain-header {
		width: 100%;
		height: 62px;
		display: flex;
		align-items: center;
		justify-content: flex-start;
		-webkit-app-region: no-drag;

		.avator {
			width: 40px;
			height: 40px;
			border-radius: 20px;
			overflow: hidden;
		}

		.userinfo {
			width: 116px;

			div {
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
		}
	}

	.contain-search {
		-webkit-app-region: no-drag;

		.search_itme {
			width: 100%;
			height: 32px !important;
			line-height: 32px !important;
			border-radius: 8px;
			font-size: map-get($map: $body2, $key: size) !important;
			padding-left: 8px;
			padding-right: 8px;
			border: 1px solid $input-stroke;
			box-sizing: border-box;
			// background: $grey-1;
			position: relative;

			.search_icon {
				margin-bottom: 8px;
				color: $title;
			}

			.search_clean {
				margin-bottom: 8px;
				color: $title;
			}

			.command {
				display: inline-block;
				height: 32px;
				position: absolute;
				top: 0;
				right: 0;
				display: flex;
				align-items: center;
				justify-center: center;
				color: $grey-5;

				.k {
					height: 16px;
					line-height: 16px;
					display: inline-block;
					color: $grey-5;
				}
			}
		}
	}

	.menuList {
		margin-top: 20px;

		.title-active {
			color: $title;
		}

		.title-normal {
			color: $sub-title;
		}
	}
}
</style>
