<template>
	<q-item clickable dense class="terminus-account-root row items-center">
		<terminus-avatar
			v-if="user.name"
			:info="userStore.getUserTerminusInfo(user.id)"
			:size="40"
			class="avatar-circle"
		/>
		<div
			class="terminus-account-root__img row items-center justify-center"
			v-else
		>
			<q-icon name="sym_r_person" size="20px" color="text-color-title" />
		</div>

		<div class="terminus-account-root__right row items-center justify-between">
			<div class="terminus-account-root__right__text column justify-between">
				<div class="row items-center">
					<div
						class="text-subtitle2"
						style="text-align: left"
						:class="{
							'text-title': user.name,
							'text-grey-4': !user.name,
							'current-user': user.name && user.id == userStore.current_user?.id
						}"
					>
						{{ user.name ? user.local_name : t('terminus_name_not_created') }}
					</div>
					<div v-if="user.name && user.id == userStore.current_user?.id">
						<terminus-user-status class="q-ml-sm" />
					</div>
				</div>

				<div
					class="text-body3"
					style="text-align: left"
					:class="user.name ? 'text-sub-title' : 'text-grey'"
				>
					{{ subInfo }}
				</div>
			</div>

			<div class="column justify-center" v-if="$slots.side">
				<slot name="side" />
			</div>
		</div>
	</q-item>
</template>

<script setup lang="ts">
import '../../css/terminus.scss';
import { onMounted, PropType, ref } from 'vue';
import { UserItem } from '@didvault/sdk/src/core';
import { generateStringEllipsis } from '../../utils/utils';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '../../stores/user';
import TerminusUserStatus from './TerminusUserStatus.vue';

const { t } = useI18n();
const userStore = useUserStore();

const props = defineProps({
	user: {
		type: Object as PropType<UserItem>,
		required: true
	},
	itemHeight: {
		type: Number,
		default: 64,
		required: false
	}
});

const subInfo = ref();

onMounted(() => {
	if (props.user.name) {
		subInfo.value = '@' + props.user.domain_name;
	} else {
		subInfo.value = props.user.id
			? generateStringEllipsis(props.user.id as string, 23)
			: '';
	}
});
</script>

<style scoped lang="scss">
.terminus-account-root {
	width: 100%;
	padding: 12px;
	height: 64px;
	border-radius: 8px;
	border: 1px solid $grey-2;

	&__img {
		width: 40px;
		height: 40px;
		border-radius: 20px;
		background: $grey-1;
	}

	&__right {
		height: 100%;
		width: calc(100% - 54px);
		margin-left: 12px;

		&__text {
			height: 100%;
			width: calc(100% - 83px);
		}
	}

	.current-user {
		max-width: 98px;
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
	}
}
</style>
