<template>
	<q-dialog class="card-dialog" v-model="show" ref="dialogRef">
		<q-card class="card-continer">
			<terminus-dialog-bar
				:label="title"
				icon=""
				titAlign="text-left"
				@close="onDialogCancel"
			/>

			<div
				class="dialog-desc"
				:style="{ textAlign: isMobile ? 'center' : 'left' }"
			>
				{{ message }}
			</div>

			<terminus-dialog-footer
				okText="Confirm"
				:cancelText="t('cancel')"
				showCancel
				@close="onDialogCancel"
				@submit="onDialogOK"
			/>
		</q-card>
	</q-dialog>
</template>

<script lang="ts" setup>
import { useDialogPluginComponent, useQuasar } from 'quasar';
import { ref, defineProps } from 'vue';
import TerminusDialogBar from '../../../components/common/TerminusDialogBar.vue';
import TerminusDialogFooter from '../../../components/common/TerminusDialogFooter.vue';
import { useI18n } from 'vue-i18n';

const { dialogRef, onDialogCancel, onDialogOK } = useDialogPluginComponent();
const $q = useQuasar();
const isMobile = ref(process.env.PLATFORM == 'MOBILE' || $q.platform.is.mobile);
const show = ref(true);

defineProps({
	title: String,
	message: String,
	navigation: String,
	position: String
});

const { t } = useI18n();
</script>

<style lang="scss" scoped>
.card-dialog {
	.card-continer {
		width: 400px;
		border-radius: 12px;

		.dialog-desc {
			padding-left: 20px;
		}
	}
}
</style>
