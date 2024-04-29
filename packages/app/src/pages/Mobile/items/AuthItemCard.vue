<template>
	<div
		class="authenticator-card row items-center justify-between"
		v-show="totpFiledRef"
		@click="onCardClick"
	>
		<div>
			<span class="authenticator-card__code text-h5" v-if="errorMessageRef">{{
				errorMessageRef
			}}</span>

			<span class="hideCode" v-if="isHideRef && !errorMessageRef">
				<i></i>
				<i></i>
				<i></i>
				<i></i>
				<i></i>
				<i></i>
			</span>

			<span
				class="authenticator-card__code text-h5"
				v-if="!isHideRef && !errorMessageRef"
			>
				{{ tokenRef.substring(0, 3) + ' ' + tokenRef.substring(3, 6) }}
			</span>
		</div>
		<q-circular-progress
			:value="ageRef"
			size="24px"
			:thickness="1"
			color="white"
		/>
	</div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { base32ToBytes, Field, hotp, VaultType } from '@didvault/sdk/src/core';
import { getVaultsByType } from '../../../utils/terminusBindUtils';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const interval = 30;
let counter = 0;

const tokenRef = ref('');
const errorMessageRef = ref('');
const ageRef = ref(0);
const updateTimeoutRef = ref(-1);

const totpFiledRef = ref<Field | undefined>();
const isHideRef = ref(true);

const itemList = getVaultsByType(VaultType.TerminusTotp);
if (itemList.length > 0) {
	totpFiledRef.value = itemList[0].fields.find((value) => {
		return value.type === 'totp';
	});
}

const onCardClick = () => {
	isHideRef.value = !isHideRef.value;
};

const _update = async (updInt = 2000) => {
	window.clearTimeout(updateTimeoutRef.value);

	if (!totpFiledRef.value || !totpFiledRef.value?.value) {
		tokenRef.value = '';
		ageRef.value = 0;
		return;
	}

	const time = Date.now();

	const tempCounter = Math.floor(time / 1000 / interval);
	if (tempCounter !== counter) {
		try {
			tokenRef.value = await hotp(
				base32ToBytes(totpFiledRef.value!.value),
				tempCounter
			);
			errorMessageRef.value = '';
		} catch (e) {
			tokenRef.value = '';
			errorMessageRef.value = t('errors.invalid_code');
			ageRef.value = 0;
			return;
		}
		counter = tempCounter;
	}

	ageRef.value = (((Date.now() / 1000) % interval) / interval) * 100;

	if (updInt) {
		updateTimeoutRef.value = window.setTimeout(() => _update(updInt), updInt);
	}
};

onMounted(() => {
	_update();
});

onUnmounted(() => {
	window.clearTimeout(updateTimeoutRef.value);
});
</script>

<style lang="scss" scoped>
.authenticator-card {
	width: 100%;
	height: 60px;
	border-radius: 20px;
	padding: 18px 20px;
	background: #1f1814;

	&__code {
		display: flex;
		align-items: center;
		color: $white;
	}

	.hideCode {
		font-size: 40px;
		color: $white;
		display: flex;
		align-items: center;
		justify-content: center;
		i {
			width: 8px;
			height: 8px;
			border-radius: 4px;
			background: $white;
			display: inline-block;
			margin-right: 8px;
		}
	}
}
</style>
