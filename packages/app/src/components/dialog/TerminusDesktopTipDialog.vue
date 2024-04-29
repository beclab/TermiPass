<template>
	<q-dialog class="card-dialog" v-model="showDialog" ref="dialogRef">
		<q-card class="card-continer">
			<terminus-dialog-bar
				:label="title"
				icon=""
				titAlign="text-left"
				@close="onCancel"
			/>
			<div class="dialog-desc">
				<div>
					{{ message }}
				</div>
			</div>
			<terminus-dialog-footer
				:okText="confirmBtnTitle"
				:showCancel="showCancel"
				:cancel-text="cancelBtnTitle"
				:loading="false"
				@close="onCancel"
				@submit="submit"
			/>
		</q-card>
	</q-dialog>
</template>

<script lang="ts" setup>
import { useDialogPluginComponent } from 'quasar';
import { ref } from 'vue';
import TerminusDialogBar from '../common/TerminusDialogBar.vue';
import TerminusDialogFooter from '../common/TerminusDialogFooter.vue';
import { i18n } from '../../boot/i18n';

defineProps({
	title: {
		type: String,
		default: '',
		required: false
	},
	message: {
		type: String,
		default: '',
		required: false
	},

	confirmBtnTitle: {
		type: String,
		default: i18n.global.t('confirm'),
		required: false
	},
	cancelBtnTitle: {
		type: String,
		default: i18n.global.t('cancel'),
		required: false
	},
	showCancel: {
		type: Boolean,
		default: false,
		required: false
	}
});

const { dialogRef, onDialogCancel, onDialogOK } = useDialogPluginComponent();

const showDialog = ref(true);

const onCancel = () => {
	onDialogCancel();
};

const submit = async () => {
	onDialogOK();
};
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
