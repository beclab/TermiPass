<template>
	<div class="integration-root">
		<terminus-title-bar
			right-icon="sym_r_add"
			@on-right-click="addClick"
			:title="t('integration.title')"
		/>
		<terminus-scroll-area class="integration-scroll">
			<template v-slot:content>
				<q-list class="integration-list">
					<terminus-item
						v-for="account in accounts"
						:key="`${account.type}_${account.name}`"
						:show-board="true"
						:item-height="64"
						:image-path="getAccountIcon(account)"
						:icon-size="40"
						class="q-mt-sm"
					>
						<template v-slot:title>
							<div class="row items-center">
								<div class="text-subtitle2 account-title">
									{{ account.name }}
								</div>
								<div
									class="status-common text-caption q-px-md q-ml-sm row items-center justify-center"
									:class="
										account.available ? 'status-available' : 'status-unabled'
									"
								>
									{{ account.available ? t('active') : t('inactive') }}
								</div>
							</div>
						</template>
						<template v-slot:detail>
							<div class="text-ink-3">
								{{ `Authorized time:${formattedDate(account.create_at)}` }}
							</div>
						</template>
						<template v-slot:side>
							<q-icon name="sym_r_keyboard_arrow_right" size="20px" />
						</template>
					</terminus-item>
				</q-list>
			</template>
		</terminus-scroll-area>
	</div>
</template>

<script setup lang="ts">
import TerminusTitleBar from '../../../components/common/TerminusTitleBar.vue';
import TerminusScrollArea from '../../../components/common/TerminusScrollArea.vue';
import { useIntegrationStore } from '../../../stores/integration';
import { onMounted } from 'vue';
import { ref } from 'vue';
import { IntegrationAccountMiniData } from '../../../services/abstractions/integration/integrationService';
import TerminusItem from '../../../components/common/TerminusItem.vue';
import { useI18n } from 'vue-i18n';

import integrationService from '../../../services/integration';
import { date } from 'quasar';

const integrationStore = useIntegrationStore();

const { t } = useI18n();

const addClick = () => {
	console.log('add');
};

const accounts = ref<IntegrationAccountMiniData[]>([]);

onMounted(async () => {
	accounts.value = await integrationStore.getAccount('all');
});

const getAccountIcon = (data: IntegrationAccountMiniData) => {
	const account = integrationService.getAccountByType(data.type);
	if (!account) {
		return '';
	}
	return `setting/integration/${account.detail.icon}`;
};

const formattedDate = (datetime: number) => {
	if (datetime <= 0) {
		return '--';
	}
	return date.formatDate(datetime, 'YYYY-MM-DD HH:mm:ss');
};
</script>

<style scoped lang="scss">
.integration-root {
	width: 100%;
	height: 100%;

	.integration-scroll {
		width: 100%;
		height: calc(100% - 56px);
		.integration-list {
			padding-left: 20px;
			padding-right: 20px;
			width: 100%;

			.status-common {
				height: 20px;
				border-radius: 4px;
			}

			.status-available {
				background: $green-soft;
				color: $positive;
			}

			.status-unabled {
				background: $red-soft;
				color: $negative;
			}
		}
	}
}
</style>
