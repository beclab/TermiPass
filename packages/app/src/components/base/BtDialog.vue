<template>
	<q-dialog
		class="d-creatVault text-center"
		ref="root"
		v-model="model"
		persistent
		@hide="onDialogHide"
	>
		<q-card class="q-dialog-plugin-web" flat>
			<q-bar class="bg-background-3">
				<span class="text-subtitle3 text-ink-1">
					{{ title }}
				</span>
				<q-space />
				<q-btn
					class="text-ink-3"
					dense
					flat
					icon="close"
					@click="onCancelClick"
					v-close-popup
				>
					<q-tooltip>Close</q-tooltip>
				</q-btn>
			</q-bar>

			<q-card-section>
				<div class="content text-left text-ink-1" v-if="message">
					{{ message }}
				</div>
			</q-card-section>

			<q-card-actions class="row justify-end items-center q-mb-sm">
				<q-item
					clickable
					dense
					class="but-cancel-web text-body3 text-ink-2 row justify-center items-center q-px-md q-mr-lg"
					@click="onCancelClick"
				>
					{{ cancelTxt }}
				</q-item>
				<q-item
					clickable
					dense
					class="but-creat-web text-body3 text-ink-on-brand-black row justify-center items-center q-px-md q-mr-md"
					@click="onOKClick"
				>
					{{ confirmTxt }}
				</q-item>
			</q-card-actions>
		</q-card>
	</q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import { useMenuStore } from '../../stores/menu';

defineProps({
	title: {
		type: String,
		default: 'Title',
		required: false
	},
	icon: {
		type: String,
		default: 'removeFile',
		required: false
	},
	message: {
		type: String,
		default: '',
		required: false
	},
	confirmTxt: {
		type: String,
		default: 'OK',
		required: false
	},
	cancelTxt: {
		type: String,
		default: 'Cancel',
		required: false
	}
});
const store = useMenuStore();
const emit = defineEmits(['ok', 'hide']);
const root = ref<any>(null);
const model = ref(true);

// const show = () => {
//   root.value.show();
// }

const hide = () => {
	store.dialogShow = false;
	root.value.hide();
};

const onDialogHide = () => {
	emit('hide');
};

const onOKClick = () => {
	emit('ok');
	hide();
};

const onCancelClick = () => {
	hide();
};
</script>

<style lang="scss" scoped>
.d-creatVault {
	.q-dialog-plugin-web {
		width: 400px;
		border-radius: 12px;

		.but-creat-web {
			border-radius: 8px;
			background: $yellow-default;
		}
		.but-cancel-web {
			border-radius: 8px;
			border: 1px solid $btn-stroke;
		}
	}
}
</style>
