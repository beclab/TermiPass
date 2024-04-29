<template>
	<q-drawer
		v-model="store.leftDrawerOpen"
		:behavior="behavior"
		show-if-above
		bordered
		:width="240"
		height="100%"
		class="drawer"
	>
		<q-scroll-area
			style="height: 100%"
			:thumb-style="scrollBarStyle.thumbStyle"
		>
			<bt-menu
				:items="store.menus"
				:default-active="VaultMenuItem.ALLVAULTS"
				@select="selectHandler"
				style="width: 240px"
				active-class="vault-active-link"
			>
				<template #header>
					<div
						class="row items-center justify-center"
						v-if="isMobile"
						style="height: 56px"
					>
						<q-img src="/img/termipass-logo.svg" width="150px" />
					</div>

					<q-item-label class="logo q-px-sm" v-if="isWeb">
						<q-item-section avatar>
							<q-avatar color="primary" text-color="white">
								<TerminusAvatar :info="userStore.terminusInfo()" :size="40" />
							</q-avatar>
						</q-item-section>

						<div>
							<div class="text-color-sub-title did">
								{{ current_user?.local_name }}
							</div>
							<div class="name">@{{ current_user?.domain_name }}</div>
						</div>
					</q-item-label>
				</template>

				<template #extra-MyLibraries>
					<q-icon
						size="xs"
						name="sym_r_add_circle"
						@click="handleNewLib($event)"
					/>
				</template>
			</bt-menu>
		</q-scroll-area>

		<div class="row absolute-bottom q-py-sm bottomBar">
			<q-icon
				v-if="syncing"
				class="q-ml-md q-mr-sm rotate"
				name="sym_r_progress_activity"
				size="24px"
				color="green"
			/>
			<q-icon
				v-else
				class="q-ml-md q-mr-sm cursor-pointer"
				name="sym_r_refresh"
				size="24px"
				@click="sync"
			>
				<q-tooltip class="bg-grey text-caption" :offset="[0, 0]"
					>Refresh</q-tooltip
				>
			</q-icon>

			<span
				class="row items-center justify-center text-caption text-green"
				v-if="syncing"
			>
				{{ t('syncing') }}
			</span>
			<span class="row items-center justify-center text-caption" v-else>
				{{
					t('last_sync_time', {
						time: lastSyncTime
					})
				}}
			</span>
		</div>
	</q-drawer>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, watch } from 'vue';
import { date } from 'quasar';
import { useRouter } from 'vue-router';
import { app, OrgMenu } from '../../globals';
import { useMenuStore } from '../../stores/menu';
import { useUserStore } from '../../stores/user';
import { hiddenChar } from '../../utils/utils';
import { scrollBarStyle, VaultMenuItem } from '../../utils/contact';
import { busOn, busOff } from '../../utils/bus';
import { useI18n } from 'vue-i18n';

type ExpansionType = {
	name: string;
	value: boolean;
};

export default defineComponent({
	name: 'ItemsDrawer',
	components: {},

	setup() {
		// const $q = useQuasar();
		const Router = useRouter();
		const orgMode = ref();
		const dialogShow = ref(false);
		const syncing = ref(app.state.syncing);

		const { t } = useI18n();

		const lastSyncTime = ref(date.formatDate(app.state.lastSync, 'HH:mm:ss'));

		const count = ref(app.count);
		const tags = ref(app.tags);
		let active = ref('vault');
		const behavior = ref();

		const isWeb = ref(process.env.PLATFORM == 'WEB');
		const isMobile = ref(
			process.env.PLATFORM == 'MOBILE' || process.env.IS_BEX
		);

		const store = useMenuStore();
		const userStore = useUserStore();

		const current_user = ref(userStore.current_user);
		const accountName = app.account?.name;

		const theme = ref(app.settings.theme);

		const adminOrgs = ref<any>([]);

		watch(
			() => store.currentItem,
			(newValue, oldValue) => {
				if (newValue == oldValue) {
					return;
				}
				active.value = newValue;
			}
		);

		function stateUpdate() {
			let orgs = app.orgs.filter((org) => org.isAdmin(app.account!));
			let myteamMember = app.orgs[0].getVaultsForMember(app.account);
			for (let i = 0; i < myteamMember.length; i++) {
				const el = myteamMember[i];
				el.count = app.getVault(el.id)?.items.size;
			}

			store.updateMenu({
				tags: app.tags,
				myteamOrg: myteamMember,
				count: app.count,
				orgs,
				invites: app.authInfo?.invites
			});

			count.value = app.count;
			tags.value = app.tags;
			syncing.value = app.state.syncing;
			lastSyncTime.value = date.formatDate(app.state.lastSync, 'HH:mm:ss');
		}

		const getAdminOrgs = () => {
			let orgs = app.orgs.filter((org) => org.isAdmin(app.account!));
			adminOrgs.value = orgs;
		};

		const selectHandler = (value) => {
			if (
				value.item.label === VaultMenuItem.SECURITYREPORT ||
				value.item.label === VaultMenuItem.PASSWORDGENERATOR ||
				value.item.label === VaultMenuItem.SETTINGS
			) {
				selectTools(value.key);
			} else if (value.item.label === VaultMenuItem.LOCKSCREEN) {
				lock();
			} else if (value.item && value.item.org_id) {
				selectOrgMenu(value.item.org_id, value.item.label);
			} else if (value.item && value.item.orgId) {
				gotoInvited(value.item, OrgMenu.INVITES);
			} else if (value.item && value.item.vaultId) {
				changeItemMenu(value.item.label, '', value.item.vaultId);
			} else {
				changeItemMenu(value.item.label);
			}
		};

		onMounted(async () => {
			busOn('appSubscribe', () => {
				stateUpdate();
				getAdminOrgs();
			});

			if (process.env.PLATFORM === 'MOBILE' || process.env.PLATFORM === 'BEX') {
				behavior.value = 'default';
			} else {
				behavior.value = 'desktop';
			}
			sync();
		});

		onUnmounted(() => {
			busOff('appSubscribe');
		});

		function goto(path: string) {
			Router.push({
				path: path
			});
		}

		function lock() {
			active.value = 'lock';
			store.clear();
			app.lock();
			Router.push({
				path: '/unlock'
			});
		}

		async function sync() {
			await app.synchronize();
		}

		const changeItemMenu = (
			itemName: string,
			itemTag?: string,
			vaultID = ''
		): void => {
			active.value = itemName;
			if (vaultID) {
				store.currentItem = itemName;
			}
			store.changeItemMenu(itemName, itemTag, vaultID);
			goto('/items/');
		};

		const selectOrgMenu = (org_id: string, menu: OrgMenu): void => {
			active.value = menu;
			store.selectOrgMenu(org_id, menu);
			store.currentItem = menu;
			goto('/org/' + menu);
		};

		const gotoInvited = (invite: any, menu: OrgMenu) => {
			goto('/invite-recipient/' + invite.orgId + '/' + invite.id);
			active.value = menu;
			store.selectOrgMenu(invite.orgId, menu);
		};

		const selectTools = (menu: string) => {
			active.value = menu;
			store.clear();
			goto(`/${menu}`);
		};

		if (theme.value === 'auto') {
			if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
				// $q.dark.set(true);
			} else {
				// $q.dark.set(false);
			}
		}

		const tagExpFlag = ref(false);
		const vaultExpFlag = ref(false);
		const teamsExpFlag = ref(false);

		const updataExpansion = (obj: ExpansionType) => {
			switch (obj.name) {
				case 'vault':
					vaultExpFlag.value = obj.value;
					break;

				case 'tag':
					tagExpFlag.value = obj.value;
					break;

				case 'teams':
					teamsExpFlag.value = obj.value;
					break;

				default:
					break;
			}
		};

		return {
			userStore,
			goto,
			lock,
			count,
			tags,
			store,
			active,
			sync,
			theme,
			app,
			syncing,
			changeItemMenu,
			dialogShow,
			hiddenChar,
			adminOrgs,
			OrgMenu,
			selectOrgMenu,
			orgMode,
			gotoInvited,
			lastSyncTime,
			updataExpansion,
			tagExpFlag,
			vaultExpFlag,
			teamsExpFlag,
			behavior,
			isWeb,
			isMobile,
			current_user,
			accountName,
			scrollBarStyle,
			selectHandler,
			VaultMenuItem,
			t
		};
	}
});
</script>

<style lang="scss">
.vault-active-link {
	color: $grey-10;
	background: rgba(255, 235, 59, 0.1);
}
</style>

<style lang="scss" scoped>
.logo {
	width: 100%;
	height: 80px;
	display: flex;
	align-items: center;
	justify-center: justify-between;

	.name,
	.did {
		width: 150px;
		line-height: 24px;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}
}

.bottomBar {
	border-top: 1px solid $grey-2;
	background: $white;
}

.rotate {
	animation: aniRotate 0.8s linear infinite;

	&:hover {
		background: transparent !important;
	}
}

@keyframes aniRotate {
	0% {
		transform: rotate(0deg);
	}

	50% {
		transform: rotate(180deg);
	}

	100% {
		transform: rotate(360deg);
	}
}

@keyframes rotate0 {
	0% {
		transform: rotate(0deg);
	}

	100% {
		transform: rotate(180deg);
	}
}

@keyframes rotate {
	0% {
		transform: rotate(180deg);
	}

	100% {
		transform: rotate(0deg);
	}
}
</style>
