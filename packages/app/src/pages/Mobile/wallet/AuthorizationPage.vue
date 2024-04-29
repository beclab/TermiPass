<template>
	<div class="authorization-root">
		<connect-header
			:title="t('notification')"
			:dappLogo="dappLogo"
			:dappUrl="dappUrl"
			:action="t('requesting_call_termiPass')"
			:showDappInfo="true"
		/>
		<div class="text-color-title text-h6">
			{{ approvalTypeRef }}
		</div>
		<q-scroll-area class="scroll-area">
			<div class="text-color-title text-body2 params">
				{{ paramsRef }}
			</div>
		</q-scroll-area>
		<div
			class="row justify-between items-center"
			style="margin-top: 20px; width: 100%"
		>
			<confirm-button
				style="width: 45%"
				text-classes="text-color-title"
				bg-classes="bg-color-white"
				:btn-title="t('reject')"
				@onConfirm="rejectAction"
			/>
			<confirm-button
				style="width: 45%"
				:btn-title="t('approve')"
				@onConfirm="approveAction"
			/>
		</div>
	</div>
</template>

<script lang="ts" setup>
import ConnectHeader from './ConnectHeader.vue';
import ConfirmButton from '../../../components/common/ConfirmButton.vue';
import { useRouter } from 'vue-router';
import { useBexStore } from '../../../stores/bex';
import { ref } from 'vue';
import { useApproval } from './approval';
import { APPROVAL_TYPE } from '../../../extension/provider/utils';
import { useI18n } from 'vue-i18n';

const $router = useRouter();
const store = useBexStore();
const { t } = useI18n();

const dappLogo = ref('');
const dappUrl = ref('');
const approvalTypeRef = ref();
const paramsRef = ref();

store.controller.getApproval().then((approval) => {
	if (approval) {
		const origin = approval.data.session.origin;
		const icon = approval.data.session.icon;
		if (origin && typeof origin === 'string') {
			dappUrl.value = origin;
		}
		if (icon && typeof icon === 'string') {
			dappLogo.value = icon;
		}
		approvalTypeRef.value = approval.data.approvalType;
		paramsRef.value = approval.data.params;
	}
});

const rejectAction = async () => {
	const { rejectApproval } = useApproval($router);
	await rejectApproval();
};

const approveAction = async () => {
	const { resolveApproval } = useApproval($router);
	if (approvalTypeRef.value === APPROVAL_TYPE.SIGN_PRESENTATION) {
		await resolveApproval({ routerPath: '/VC_card_list' });
	} else {
		await resolveApproval();
	}
};
</script>

<style scoped lang="scss">
.authorization-root {
	width: 100%;
	height: 100%;

	.scroll-area {
		width: 100%;
		height: 300px;

		.params {
			margin-top: 10px;
			margin-bottom: 10px;
			margin-left: 20px;
		}
	}
}
</style>
