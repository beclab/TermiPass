<template>
	<div class="integration-root">
		<terminus-title-bar
			right-icon="sym_r_more_horiz"
			@on-right-click="moreClick"
		/>
		<terminus-scroll-area class="integration-scroll">
			<template v-slot:content> </template>
		</terminus-scroll-area>
	</div>
</template>

<script setup lang="ts">
import TerminusTitleBar from '../../../components/common/TerminusTitleBar.vue';
import TerminusScrollArea from '../../../components/common/TerminusScrollArea.vue';
import { useQuasar } from 'quasar';
import IntegrationActionsDialog from './IntegrationActionsDialog.vue';
import TerminusTipDialog from '../../../components/dialog/TerminusTipDialog.vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import {
	AccountType,
	IntegrationAccountMiniData,
	IntegrationPermissions
} from '../../../services/abstractions/integration/integrationService';
import { ref } from 'vue';
import { useIntegrationStore } from '../../../stores/integration';
import integrationService from '../../../services/integration/index';
import { onMounted } from 'vue';

const $q = useQuasar();

const { t } = useI18n();

const route = useRoute();
const router = useRouter();

const integrationStore = useIntegrationStore();

const type = route.params.type as AccountType;
const name = route.params.name as string;
const accountData = ref<IntegrationAccountMiniData | undefined>();
const detailInfo = ref<IntegrationPermissions | undefined>();
onMounted(async () => {
	accountData.value = integrationStore.accounts.find(
		(e) => e.type == type && e.name == name
	);
	try {
		if (!accountData.value) {
			const accounts = await integrationStore.getAccountByTypeAndName(
				type,
				name
			);
			if (accounts && accounts.length > 0) {
				accountData.value = accounts[0];
				detailInfo.value = await integrationService
					.getInstanceByType(accountData.value!.type)
					?.permissions();
			}
		}
	} catch (error) {
		console.log(error);
	}
	if (!accountData.value) {
		router.back();
	}
});

const moreClick = () => {
	$q.dialog({
		component: IntegrationActionsDialog,
		componentProps: {}
	}).onOk(async (operate: string) => {
		if (operate == 'delete') {
			if (!accountData.value) {
				return;
			}
			$q.dialog({
				component: TerminusTipDialog,
				componentProps: {
					title: t('delete_account'),
					message: accountData.value!.name,
					navigation: t('cancel'),
					position: t('delete')
				}
			}).onOk(async () => {
				// deleteAccount();
				await integrationStore.deleteAccount(accountData.value);
				router.back();
			});
		}
	});
};
</script>

<style scoped lang="scss"></style>
