<template>
	<q-dialog
		class="d-creatVault text-center"
		ref="root"
		v-model="model"
		persistent
		@hide="onDialogHide"
	>
		<q-card class="q-dialog-plugin-web">
			<q-bar class="bg-grey-1">
				<div class="text-subtitle2">
					{{ title }}
				</div>
				<q-space />
				<q-btn dense flat icon="close" @click="onCancelClick" v-close-popup>
					<q-tooltip>Close</q-tooltip>
				</q-btn>
			</q-bar>

			<q-card-section>
				<div class="content text-left" v-if="message">
					{{ message }}
				</div>
			</q-card-section>

			<q-card-actions class="row justify-end items-center q-mb-sm">
				<q-item
					clickable
					dense
					class="but-cancel-web text-subtitle3 row justify-center items-center q-px-md q-mr-lg text-grey-8"
					@click="onCancelClick"
				>
					{{ cancelTxt }}
				</q-item>
				<q-item
					clickable
					dense
					class="but-creat-web text-subtitle3 row justify-center items-center q-px-md q-mr-md text-grey-8"
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
			background: $yellow;
		}
		.but-cancel-web {
			border-radius: 8px;
			border: 1px solid $grey-2;
		}
	}
}
</style>
