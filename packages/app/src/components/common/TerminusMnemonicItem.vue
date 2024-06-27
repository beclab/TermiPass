<template>
	<div class="terminus-mnemonic">
		<div
			class="terminus-mnemonic__bg row wrap justify-between items-center"
			:class="
				isError
					? 'terminus-mnemonic__error_bg'
					: isBackup && inputValue.length > 0
					? 'terminus-mnemonic__backup_bg'
					: 'terminus-mnemonic__bg'
			"
		>
			<div class="terminus-mnemonic__bg__input__index text-body2 q-ml-xs">
				{{ index + 1 }}.
			</div>
			<q-input
				ref="inputRef"
				:name="inputName(index)"
				autocomplete="off"
				v-model="inputValue"
				type="text"
				dense
				class="terminus-mnemonic__bg__input text-body2"
				borderless
				:input-style="{ textAlign: 'left' }"
				input-class="text-ink-1"
				:readonly="isReadOnly"
				@update:model-value="onTextChange"
				@blur="inputBlur"
				text-align="center"
			/>

			<q-icon
				v-if="isBackup && !backupReadonly && inputText.length > 0"
				@click="backupItemRemove"
				name="sym_r_cancel"
				size="20px"
				style="
					position: absolute;
					right: -8px;
					top: -8px;
					cursor: pointer;
					border-radius: 12px;
				"
				color="grey-4"
			>
			</q-icon>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import '../../css/terminus.scss';

const props = defineProps({
	inputText: {
		type: String,
		default: '',
		require: false
	},
	isError: {
		type: Boolean,
		default: false,
		require: false
	},
	isReadOnly: {
		type: Boolean,
		default: false,
		require: false
	},
	index: {
		type: Number,
		default: 0,
		require: true
	},
	isBackup: {
		type: Boolean,
		required: false,
		default: false
	},
	backupReadonly: {
		type: Boolean,
		required: false,
		default: true
	}
});

const inputRef = ref();

const inputValue = ref(props.inputText);
const emit = defineEmits([
	'onTextChange',
	'onFinishedEdit',
	'onBackupDeleteItem'
]);

let isUpdating = false;

function onTextChange(value: any) {
	if (isUpdating) {
		return;
	}
	isUpdating = true;
	let formatValue = value;
	let next = false;
	if (value.endsWith(' ')) {
		formatValue = value.trim();
		next = true;
	}
	formatValue = formatValue.toLowerCase();
	setInputText(formatValue);
	emit(
		'onTextChange',
		props.index,
		formatValue,
		next,
		inputName(props.index + 1)
	);
	isUpdating = false;
}

const inputBlur = () => {
	emit('onFinishedEdit', props.index, inputValue.value);
};

function setInputText(text: string) {
	inputValue.value = text;
}

const inputName = (index: number) => {
	return 'mnemonic_name_index_' + index;
};

const backupItemRemove = () => {
	emit('onBackupDeleteItem', props.index);
};

defineExpose({ setInputText });
</script>

<style lang="scss" scoped>
.terminus-mnemonic {
	width: auto;
	min-height: 36px;

	&__bg {
		min-height: 100%;
		width: 100%;
		padding: 0;
		border-radius: 8px;
		height: 36px;
		border: 1px solid $separator;

		&__input {
			width: calc(100% - 25px);
			margin-top: -3px;
		}

		&__input__index {
			margin-top: -5px;
			text-align: left;
			width: 18px;
			height: 16px;
			color: $ink-2;
		}
	}

	&__error_bg {
		min-height: 100%;
		width: 100%;
		padding: 0;
		border-radius: 8px;
		border: 1px solid $red;
	}

	&__backup_bg {
		min-height: 100%;
		width: 100%;
		padding: 0;
		border-radius: 8px;
		border: 1px solid $yellow;
	}
}
</style>
