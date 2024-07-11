<template>
	<div class="terminus-edit">
		<div class="login-label" v-show="label">
			{{ label }}
		</div>
		<div
			class="terminus-edit__bg bg-background-2 row wrap justify-between items-center"
			:class="
				isError
					? 'terminus_background_edt_error'
					: isReadOnly
					? 'terminus_background_edt_read_only'
					: 'terminus_background_edt'
			"
			:style="transaction ? 'background : transparent;' : ''"
		>
			<img
				:src="inputImageRef"
				style="margin-left: 12px"
				v-if="inputImg.length > 0"
			/>
			<q-input
				:model-value="modelValue"
				:type="inputTypeRef"
				class="terminus-edit__bg__input text-body3"
				bg-color="transparent"
				:placeholder="hintText"
				borderless
				:input-style="{
					color: inputColor,
					fontWeight: `${
						inputTypeRef === 'password' && !$q.platform.is.ios ? '800' : '400'
					}`,
					fontSize: `${
						inputTypeRef === 'password' && $q.platform.is.ios
							? '7px'
							: inputTypeRef === 'password' && !isMobile
							? '22px'
							: '12px'
					}`
				}"
				:readonly="isReadOnly"
				@update:model-value="onTextChange"
				dense
			>
				<template v-slot:append>
					<q-icon
						size="20px"
						v-if="showPasswordImg"
						:name="
							inputTypeRef === 'password'
								? 'sym_r_visibility_off'
								: 'sym_r_visibility'
						"
						@click="changeInputType"
					/>
					<div v-else>
						<slot name="right"> </slot>
					</div>
				</template>
			</q-input>
		</div>
		<div
			class="terminus-edit__error text-body3"
			v-if="errorMessage.length > 0 && isError"
		>
			{{ errorMessage }}
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';

const props = defineProps({
	label: {
		type: String,
		default: '',
		require: false
	},
	modelValue: {
		type: String,
		default: '',
		require: false
	},
	isError: {
		type: Boolean,
		default: false,
		require: false
	},
	inputImg: {
		type: String,
		default: '',
		require: false
	},
	hintText: {
		type: String,
		default: '',
		required: false
	},
	showPasswordImg: {
		type: Boolean,
		default: false,
		required: false
	},
	isReadOnly: {
		type: Boolean,
		default: false,
		require: false
	},
	emitKey: {
		type: String,
		default: '',
		require: false
	},
	inputColor: {
		type: String,
		default: '$ink-1',
		require: false
	},
	errorMessage: {
		type: String,
		default: '',
		require: false
	},
	transaction: {
		type: Boolean,
		default: false,
		require: false
	}
});

const $q = useQuasar();
const isMobile = ref(
	process.env.PLATFORM == 'MOBILE' ||
		$q.platform.is.mobile ||
		process.env.PLATFORM == 'BEX'
);
const inputImageRef = ref();
const inputTypeRef = ref<
	| 'text'
	| 'password'
	| 'textarea'
	| 'email'
	| 'search'
	| 'tel'
	| 'file'
	| 'number'
	| 'url'
	| 'time'
	| 'date'
	| undefined
>('text');
if (props.inputImg) {
	inputImageRef.value = require(`../../assets/icon/${props.inputImg}`);
}
if (props.showPasswordImg) {
	inputTypeRef.value = 'password';
}

const emit = defineEmits(['onTextChange', 'update:modelValue']);

function onTextChange(value: any) {
	if (props.emitKey?.length > 0) {
		emit('onTextChange', props.emitKey, value);
		return;
	}
	emit('update:modelValue', value);
}

function changeInputType() {
	if (inputTypeRef.value === 'text') {
		inputTypeRef.value = 'password';
	} else {
		inputTypeRef.value = 'text';
	}
}
</script>

<style lang="scss" scoped>
.terminus_background_edt {
	backdrop-filter: blur(6.07811px);
	border-radius: 8px;
	border: 1px solid $separator;
}

.terminus_background_edt_error {
	backdrop-filter: blur(6.07811px);
	border-radius: 8px;
	border: 1px solid $red;
}

.terminus_background_edt_read_only {
	background: linear-gradient(0deg, $grey-1, $grey-1);
	backdrop-filter: blur(6.07811px);
	border-radius: 8px;
	border: 1px solid $separator;
}

.terminus-edit {
	width: auto;

	&__bg {
		height: 36px;
		width: 100%;
		margin-top: 4px;
		position: relative;

		&__input {
			height: 100%;
			width: calc(100% - 30px);
			margin-top: -6px;
			margin-left: 16px;
			color: $title;
		}
	}

	&__input__less_width {
		width: calc(100% - 64px);
	}

	&__error {
		width: 100%;
		margin-top: 12px;
		color: $red;
	}
}
</style>
