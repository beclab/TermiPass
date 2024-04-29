<template>
	<div
		class="orgItemView text-color-sub-title row items-center justify-center"
		v-if="isBlank"
	>
		<img
			class="q-mb-md"
			style="margin-top: 64px"
			src="../../../../assets/layout/nodata.svg"
		/>
		<span>
			{{ t('no_vault_selected') }}
		</span>
	</div>
	<div v-else class="orgItemView">
		<div class="header">
			<div class="row items-center justify-between q-pa-md">
				<div :class="['row', 'col-11', 'items-center', 'view-hearder']">
					<div class="hearder-input row items-center">
						<q-icon
							v-if="isMobile"
							name="sym_r_chevron_left"
							size="24px"
							@click="goBack"
						/>
						<q-input
							v-if="editing_t1"
							v-model="name"
							dense
							outlined
							color="grey-7"
							ref="nameRef"
							placeholder="Enter Item Name"
							input-class="text-body3"
							style="width: 90%"
						/>
						<div v-else class="text text-subtitle1" @click="onEdit">
							{{ name ? name : t('new_item') }}
						</div>
					</div>
				</div>
				<div class="row justify-center col-1 view-option" v-if="!editing_t1">
					<q-icon name="sym_r_more_horiz" size="24px">
						<q-menu class="popup-menu">
							<q-list dense padding>
								<q-item
									class="row items-center justify-start popup-item"
									style="width: 140px"
									clickable
									v-close-popup
									@click="onDelete"
								>
									<q-icon size="22px" name="sym_r_delete" class="q-mr-sm" />
									{{ t('delete') }}
								</q-item>
							</q-list>
						</q-menu>
					</q-icon>
				</div>
			</div>
		</div>
		<div class="container2">
			<q-scroll-area
				style="height: 100%"
				:thumb-style="scrollBarStyle.thumbStyle"
			>
				<div class="listRow column justify-center">
					<div class="header q-pa-md row justify-between">
						<div class="items-center">
							<span class="text-color-sub-title text-li-title">
								{{ t('members') }}
							</span>
						</div>
						<div>
							<q-icon name="sym_r_add" size="24px" />
							<q-menu class="popup-menu" v-if="_availableMembers.length > 0">
								<q-list dense padding>
									<template
										v-for="(vault, index) in _availableMembers"
										:key="'avn' + index"
									>
										<q-item
											class="column popup-item"
											style="width: 140px"
											clickable
											v-close-popup
											@click="addMember(vault)"
										>
											<div class="text-subtitle2 member-title">
												{{ vault.did }}
											</div>
											<div class="text-subtitle2 member-section">
												{{ vault.name }}
											</div>
										</q-item>
										<q-separator v-if="index < _availableMembers.length - 1" />
									</template>
								</q-list>
							</q-menu>
							<q-menu v-else>
								<q-item class="row items-center justify-center" v-close-popup>
									{{ t('no_more_members_available') }}
								</q-item>
							</q-menu>
						</div>
					</div>

					<div class="body1">
						<div
							v-if="members.length == 0"
							class="row items-center justify-center"
							style="height: 160px"
						>
							{{ t('no_members_have_been_given_access_to_this_vault_yet') }}
						</div>

						<template v-else>
							<div
								class="listRow q-pa-md row items-center justify-between"
								v-for="(member, index) in members"
								:key="'member' + index"
							>
								<div class="col-7 rowLeft">
									<div class="avator q-mr-md">
										<TerminusAvatar
											:info="userStore.getUserTerminusInfo(member.id || '')"
											:size="28"
										/>
									</div>
									<div>
										<div class="text-body1 text-weight-bold">
											{{ member.did }}
										</div>
										<div class="text-caption text-grey-8">
											{{ member.name }}
										</div>
									</div>
								</div>
								<!-- v-if="accountDid !== member.did" -->

								<div class="col-5 rowRight">
									<q-select
										:model-value="member"
										dense
										outlined
										:disable="member.role === 0"
										:options="authOptions"
										option-label="auth"
										@update:model-value="
											(value) => {
												member.readonly = value === 'Readonly' ? true : false;
												member.auth = value;
												updateMember(member, value);
												onEdit();
											}
										"
									/>
									<q-icon
										v-if="member.role === 0"
										class="clear"
										size="24px"
										style="justify-content: stretch"
									/>
									<q-icon
										v-else
										class="clear"
										size="24px"
										name="sym_r_delete"
										style="justify-content: stretch"
										@click="removeMember(member)"
									/>
								</div>
							</div>
						</template>
					</div>
				</div>
			</q-scroll-area>
		</div>
		<div v-if="editing_t1" class="footer row iterm-center justify-between">
			<q-btn
				class="reset"
				label="Cancel"
				type="reset"
				outline
				no-caps
				@click="onCancel"
				unelevated
				color="grey-7"
			/>
			<q-btn
				class="confirm text-grey-9"
				label="Save"
				type="submit"
				@click="onSave"
				unelevated
				no-caps
				color="yellow-6"
				:loading="saveLoading"
			/>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { OrgMember } from '@didvault/sdk/src/core';
import { formatDateFromNow, formatDateTime } from '@didvault/sdk/src/util';
import { OrgMemberStatus } from '@didvault/sdk/src/core';
import { app } from '../../../../globals';
import { Dialog, useQuasar } from 'quasar';
import { useMenuStore } from '../../../../stores/menu';
import { scrollBarStyle } from '../../../../utils/contact';
import { useUserStore } from '../../../../stores/user';
import {
	notifyFailed,
	notifyWarning,
	notifySuccess
} from '../../../../utils/notifyRedefinedUtil';
import { useI18n } from 'vue-i18n';

export default defineComponent({
	name: 'OrgVaultsView',
	props: {},
	components: {},
	setup() {
		const $q = useQuasar();
		const route = useRoute();
		const router = useRouter();
		let editing_t1 = ref(false);
		const meunStore = useMenuStore();
		const now = new Date();
		const nameRef = ref();
		const accountDid = app.account?.did;
		const userStore = useUserStore();
		const org = ref();
		const isMobile = ref(
			process.env.PLATFORM == 'MOBILE' ||
				process.env.PLATFORM == 'BEX' ||
				$q.platform.is.mobile
		);

		const initOrg = () => {
			org.value = app.orgs.find((org) => org.id == meunStore.org_id);
		};

		const _vault = computed(function () {
			if (!route.params.org_type) {
				return null;
			}
			return app.getVault(route.params.org_type as string);
		});

		const groups = ref<any>([]);
		const members = ref<any>([]);
		const expiresAfter_t1 = ref<number>(30);
		const name = ref();
		const isEditExpir = ref(false);
		const authOptions = ['Readonly', 'Editable'];
		const saveLoading = ref(false);

		const _getCurrentGroups = function () {
			if (!org.value) {
				return [];
			}

			const groups: { name: string; readonly: boolean }[] = [];

			for (const group of org.value.groups) {
				const vault = group.vaults.find((v) => v.id === route.params.org_type);
				if (vault) {
					groups.push({ name: group.name, readonly: vault.readonly });
				}
			}

			return groups;
		};

		const _getCurrentMembers = function () {
			if (!org.value) {
				return [];
			}

			const members: {
				did: string;
				name: string;
				readonly: boolean;
				auth: string;
			}[] = [];

			for (const member of org.value.members) {
				const vault = member.vaults.find((v) => v.id === route.params.org_type);

				if (vault) {
					members.push({
						did: member.did,
						name: member.name,
						readonly: vault.readonly,
						// role: member.role,
						auth: vault.readonly ? 'Readonly' : 'Editable'
					});
				}
			}

			return members;
		};

		const _availableMembers = computed(function () {
			return (
				(org.value &&
					org.value.members.filter(
						(member) =>
							!members.value.some((m) => m.did === member.did) &&
							member.status === OrgMemberStatus.Active &&
							org.value.invites.find((o) => o.did !== member.did)
					)) ||
				[]
			);
		});

		async function clearChanges(): Promise<void> {
			await initOrg();
			groups.value = await _getCurrentGroups();
			members.value = [];
			let membertSelf = await _getCurrentMembers();
			for (let i = 0; i < membertSelf.length; i++) {
				const element = membertSelf[i];
				const obj = {
					...element,
					auth: element.readonly ? 'Readonly' : 'Editable'
				};
				members.value.push(obj);
			}

			name.value = (_vault.value && _vault.value.name) || 'New Vault';
		}

		watch(
			() => route.params.org_type,
			async (newVaule, oldVaule) => {
				if (oldVaule == newVaule) {
					return;
				}

				name.value = '';
				groups.value = [];
				members.value = [];

				if (route.params.org_type) {
					if (route.params.org_type == 'new') {
						editing_t1.value = true;

						let member = org.value?.getMember(app.account!);
						if (member) {
							addMember(member);
						}
						setTimeout(() => {
							nameRef.value.focus();
						}, 0);
					} else {
						// name.value = app.getVault(route.params.org_type)!.name;
						editing_t1.value = false;
						await clearChanges();
					}
				}
			}
		);

		const isBlank = computed(function () {
			if (app.state.locked) {
				return true;
			}
			if (!route.params.org_type) {
				return true;
			}
			return false;
		});

		const updateMember = (member, value) => {
			const memberself = JSON.parse(JSON.stringify(members.value));
			for (let i = 0; i < memberself.length; i++) {
				const element = memberself[i];
				if (member.did === element.did) {
					element.readonly = value === 'Readonly' ? true : false;
					element.auth = value;
				}
			}
			members.value = memberself;
		};

		function onEdit() {
			if (!editing_t1.value) {
				editing_t1.value = true;
			}

			let item2 = app.getItem(route.params.org_type as string)?.item.clone();
			isEditExpir.value = item2?.expiresAfter ? true : false;
		}

		function onCancel() {
			editing_t1.value = false;
			clearChanges();
		}

		async function onDelete() {
			const confirmed = await new Promise((resolve) =>
				Dialog.create({
					title: t('delete_vault'),
					message: t('delete_vault_message'),
					prompt: {
						model: '',
						placeholder: t('type_delete_to_confirm'),
						type: 'text',
						isValid: (val) => val.toLowerCase() === 'delete'
					},
					cancel: true,
					persistent: true
				})
					.onOk((data) => {
						if (data.toLowerCase() === 'delete') {
							resolve(true);
						} else {
							notifyWarning(t('please_re_enter'));
						}
					})
					.onCancel(() => {
						resolve(false);
					})
			);
			if (confirmed) {
				await app.deleteVault(route.params.org_type as string);
				notifySuccess(t('delete_vault_success'));
				route.params.org_type = '';
			}
		}

		const getItems = () => {
			return app.vaults.filter((vault) => vault.org?.id == meunStore.org_id);
		};

		async function onSave() {
			if (!name.value) {
				notifyFailed(t('vault_name_is_null'));
				return;
			}

			const selfMember = JSON.parse(JSON.stringify(members.value));
			for (let i = 0; i < selfMember.length; i++) {
				const element = selfMember[i];
				element.id = route.params.org_type;
				delete element.auth;
				delete element.name;
			}

			saveLoading.value = true;
			if (route.params.org_type === 'new') {
				const hasItem = getItems().find((c) => c.name === name.value);

				if (hasItem) {
					notifyFailed(t('having_the_same_vault_name'));
					saveLoading.value = false;
					return false;
				}

				const vault = await app.createVault(
					name.value,
					org.value!,
					[...selfMember],
					[...groups.value]
				);
				notifySuccess(t('create_vault_success'));
				router.push({
					path: '/org/Vaults/' + vault.id
				});
			} else {
				await app.updateVaultAccess(
					org.value!.id,
					route.params.org_type as string,
					name.value,
					[...selfMember],
					[...groups.value]
				);
				notifySuccess(t('update_vault_access_success'));
			}
			editing_t1.value = false;
			saveLoading.value = false;
		}

		function addMember({ did, name, role }: OrgMember) {
			members.value.push({
				did,
				name,
				role,
				readonly: false,
				auth: 'Editable'
			});
			onEdit();
		}

		function addGroup(group: { name: string }) {
			groups.value.push({ name: group.name, readonly: false });
		}

		function removeMember(member: OrgMember) {
			members.value = members.value.filter((m: any) => m.did !== member.did);
			onEdit();
		}

		function removeGroup(group: { name: string }) {
			groups.value = groups.value.filter((g: any) => g.name !== group.name);
		}

		const handleEditExpir = (type: number) => {
			if (!type) {
				isEditExpir.value = false;
				expiresAfter_t1.value = 0;
			} else {
				isEditExpir.value = true;
				editing_t1.value = true;
			}
		};

		const goBack = () => {
			router.go(-1);
		};

		onMounted(async () => {
			name.value = '';
			groups.value = [];
			members.value = [];
			await clearChanges();

			if (route.params.org_type) {
				if (route.params.org_type == 'new') {
					editing_t1.value = true;

					let member = org.value?.getMember(app.account!);
					if (member) {
						addMember(member);
					}
					setTimeout(() => {
						nameRef.value.focus();
					}, 0);
				} else {
					// name.value = app.getVault(route.params.org_type)!.name;
					editing_t1.value = false;
				}
			}
		});

		const { t } = useI18n();

		return {
			formatDateFromNow,
			formatDateTime,
			onEdit,
			onSave,
			onCancel,
			addMember,
			removeMember,
			addGroup,
			removeGroup,
			handleEditExpir,
			onDelete,
			members,
			groups,
			_vault,
			editing_t1,
			isBlank,
			name,
			isEditExpir,
			expiresAfter_t1,
			now,
			nameRef,
			_availableMembers,
			authOptions,
			updateMember,
			saveLoading,
			accountDid,
			goBack,
			isMobile,
			scrollBarStyle,
			userStore,
			t
		};
	}
});
</script>

<style lang="scss" scoped>
.orgItemView {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	.view-hearder {
		border-radius: 10px;
		.hearder-input {
			height: 40px;
			width: 100%;
			.text {
				height: 40px;
				line-height: 40px;
			}
		}
	}

	.view-option {
		cursor: pointer;
	}

	.container2 {
		flex: 1 1 auto;

		.tagSelect {
			width: 90%;
			.tagChip {
				margin-right: 5px;
			}
		}
	}
}

.footer {
	width: 100%;
	padding: 10px 20px;
	border-top: 1px solid #e0e0e0;
	.confirm {
		width: 48%;
	}
	.reset {
		width: 48%;
	}
}

.listRow {
	width: 100%;
	border-bottom: 1px solid #ececec;
	border-radius: 8px;
	cursor: pointer;
	.header {
		background-color: $tooltip-color;
		border-bottom: 1px solid #ececec;
	}
	.rowLeft {
		display: flex;
		align-items: center;
		justify-content: flex-start;
	}
	.rowRight {
		display: flex;
		align-items: center;
		justify-content: flex-end;
	}
}

.body1 {
	.listRow {
		.avator {
			width: 28px;
			height: 28px;
			border-radius: 14px;
			overflow: hidden;
		}
	}
}

.member-title {
	color: $title;
}
.member-section {
	color: $sub-title;
}

.q-field__control {
	height: 34px !important;
}

.text-li-title {
	margin-left: 5px;
}
</style>
