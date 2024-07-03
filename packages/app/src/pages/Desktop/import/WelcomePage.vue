<template>
	<div class="welcome-page column justify-start items-center">
		<q-img
			class="welcome-page__logo"
			:src="getRequireImage('login/termipass_logo.svg')"
		/>
		<terminus-page-title
			:center="true"
			class="page-title"
			:label="t('welcome_to_termipass')"
			:desc="t('welcome_to_termipass_desc')"
		/>
		<confirm-button
			class="welcome-page__button"
			:btn-title="t('start')"
			@onConfirm="onConfirm"
			:btn-status="ConfirmButtonStatus.normal"
		/>
	</div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';
import ConfirmButton from '../../../components/common/ConfirmButton.vue';
import { ConfirmButtonStatus } from '../../../utils/constants';
import { useI18n } from 'vue-i18n';
import TerminusPageTitle from '../../../components/common/TerminusPageTitle.vue';
import { getRequireImage } from '../../../utils/imageUtils';

const router = useRouter();
const { t } = useI18n();

async function onConfirm() {
	router.push({ path: '/setUnlockPassword' });
}
</script>

<style lang="scss" scoped>
.welcome-page {
	width: 100%;
	height: 100%;
	background: $background-1;
	padding-top: 20px;
	padding-left: 32px;
	padding-right: 32px;
	position: relative;

	&__logo {
		width: 64px;
		height: 64px;
		margin-top: 96px;
		margin-bottom: 16px;
	}

	&__button {
		position: absolute;
		bottom: 52px;
		width: calc(100% - 64px);
		left: 32px;
		right: 32px;
	}
}
</style>
