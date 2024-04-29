<template>
	<q-dialog class="card-dialog" v-model="showDialog" ref="dialogRef">
		<q-card class="card-continer">
			<terminus-dialog-bar
				label="Delete"
				icon=""
				titAlign="text-left"
				@close="onCancel"
			/>

			<div
				class="dialog-desc"
				:style="{ textAlign: isMobile ? 'center' : 'left' }"
			>
				<div>
					{{ `Are you sure you want to delete ${item.repo_name}?` }}
				</div>
				<div v-if="shared_length > 0" class="text-red">
					{{ `This library has been shared to ${shared_length} user(s).` }}
				</div>
			</div>

			<terminus-dialog-footer
				okText="Confirm"
				cancelText="Cancel"
				showCancel
				:loading="submitLoading"
				@close="onCancel"
				@submit="submit"
			/>
		</q-card>
	</q-dialog>
</template>

<script lang="ts" setup>
import { useDialogPluginComponent } from 'quasar';
import { ref } from 'vue';
import TerminusDialogBar from '../../common/TerminusDialogBar.vue';
import TerminusDialogFooter from '../../common/TerminusDialogFooter.vue';

defineProps({
	item: {
		type: Object,
		required: false
	},
	shared_length: {
		type: Number,
		require: false
	}
});

const { dialogRef, onDialogCancel, onDialogOK } = useDialogPluginComponent();

const showDialog = ref(true);
const submitLoading = ref(false);

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
