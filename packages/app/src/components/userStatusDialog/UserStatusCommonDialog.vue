<template>
	<q-dialog class="user-status-common-dialog-root text-center" ref="dialogRef">
		<UserStatusCommonContent
			@on-dialog-o-k="onDialogOK"
			:title="title"
			:btn-title="btnTitle"
			:message="message"
		>
			<template v-slot:more v-if="isReactive">
				<div
					class="row items-center justify-between q-mb-lg"
					style="width: 100%"
				>
					<div
						class="offline-mode text-subtitle1 row items-center justify-center"
						@click="offLineAction"
					>
						{{ t('user_current_status.offline_mode.enable') }}
					</div>
					<div
						class="reactivate-mode text-subtitle1 row items-center justify-center"
						@click="reactivateAction"
					>
						{{ t('reactivate') }}
					</div>
				</div>
			</template>
		</UserStatusCommonContent>
	</q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar';
import UserStatusCommonContent from './UserStatusCommonContent.vue';
import { useUserStore } from '../../stores/user';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
const { dialogRef, onDialogOK } = useDialogPluginComponent();
const userStore = useUserStore();

const $router = useRouter();

const { t } = useI18n();

defineProps({
	title: String,
	message: String,
	navigation: String,
	btnTitle: String,
	doubleBtn: {
		default: false,
		type: Boolean,
		required: false
	},
	isReactive: {
		default: false,
		type: Boolean,
		required: false
	}
});

const offLineAction = () => {
	userStore.updateOfflineMode(true);
	onDialogOK();
};

const reactivateAction = () => {
	//
	$router.push({
		path: `/Activate/${1}`
	});
	onDialogOK();
};
</script>

<style lang="scss" scoped>
.user-status-common-dialog-root {
	.q-dialog__backdrop {
		background: rgba(0, 0, 0, 0.7);
	}

	.offline-mode {
		border: 1px solid $grey-2;
		width: calc(50% - 10px);
		height: 48px;
		text-align: center;
		color: $title;
		border-radius: 8px;
	}

	.reactivate-mode {
		border: 1px solid $yellow;
		width: calc(50% - 10px);
		height: 48px;

		text-align: center;
		color: $title;
		border-radius: 8px;
		background: $yellow-1;
	}
}
</style>
