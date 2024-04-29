<template>
	<q-dialog class="card-dialog" v-model="show" ref="dialogRef">
		<q-card class="card-continer">
			<terminus-dialog-bar
				:label="$t('prompts.replace')"
				icon=""
				titAlign="text-left"
				@close="store.closeHovers"
			/>

			<div
				class="dialog-desc"
				:style="{ textAlign: isMobile ? 'center' : 'left' }"
			>
				{{ $t('prompts.replaceMessage') }}
			</div>

			<terminus-dialog-footer
				:okText="t('confirm')"
				:cancelText="t('cancel')"
				showCancel
				@close="store.closeHovers"
				@submit="(event) => store.showConfirm(event, 'replace')"
			/>
		</q-card>
	</q-dialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useDataStore } from '../../../stores/data';

import TerminusDialogBar from '../../common/TerminusDialogBar.vue';
import TerminusDialogFooter from '../../common/TerminusDialogFooter.vue';
import { useI18n } from 'vue-i18n';

const $q = useQuasar();
const isMobile = ref(process.env.PLATFORM == 'MOBILE' || $q.platform.is.mobile);
const store = useDataStore();
const show = ref(true);

const { t } = useI18n();
</script>

<style lang="scss" scoped>
.card-dialog {
	.card-continer {
		width: 400px;
		border-radius: 12px;

		.dialog-desc {
			padding-left: 20px;
			padding-right: 20px;
		}
	}
}
</style>
