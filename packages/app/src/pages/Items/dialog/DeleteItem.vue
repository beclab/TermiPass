<template>
	<q-dialog
		class="d-creatVault text-center"
		ref="dialogRef"
		v-model="dialogModel"
		persistent
		@hide="onDialogHide"
	>
		<q-card class="q-dialog-plugin">
			<terminus-dialog-bar
				:label="title"
				icon=""
				titAlign="text-left"
				@close="onDialogCancel"
			/>

			<q-card-section class="row">
				{{ content }}
			</q-card-section>

			<terminus-dialog-footer
				:okText="t('confirm')"
				:cancelText="t('cancel')"
				showCancel
				@close="onDialogCancel"
				@submit="onOKClick"
			/>
		</q-card>
	</q-dialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useDialogPluginComponent } from 'quasar';

import TerminusDialogBar from '../../../components/common/TerminusDialogBar.vue';
import TerminusDialogFooter from '../../../components/common/TerminusDialogFooter.vue';
import { useI18n } from 'vue-i18n';
import { i18n } from '../../../boot/i18n';

defineProps({
	title: {
		type: String,
		default: i18n.global.t('message'),
		required: false
	},
	content: {
		type: String,
		default: i18n.global.t('this_is_a_meeage'),
		required: false
	}
});

const dialogModel = ref(true);

const { t } = useI18n();

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
	useDialogPluginComponent();

async function onOKClick() {
	onDialogOK();
}
</script>

<style lang="scss" scoped>
.d-creatVault {
	.q-dialog-plugin {
		width: 400px;
		border-radius: 12px;
	}
}
</style>
