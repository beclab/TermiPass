<template>
	<div class="input-mnemonic-page column justify-start items-center">
		<terminus-page-title
			:center="true"
			class="page-title"
			:label="t('import_terminus_name')"
			:desc="t('import_terminus_mnemonic_desc')"
		/>
		<terminus-mnemonics-component
			ref="mnemonicRef"
			:lager-title="false"
			:row-capacity="4"
			class="input-mnemonic-page__mnemonic"
			@on-mnemonic-change="mnemonicUpdate"
			@keyup.enter="onConfirm"
		/>
		<confirm-button
			class="input-mnemonic-page__button"
			:btn-title="t('next')"
			@onConfirm="onConfirm"
			:btn-status="btnStatusRef"
		/>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import TerminusMnemonicsComponent from '../../../components/common/TerminusMnemonicsComponent.vue';
import ConfirmButton from '../../../components/common/ConfirmButton.vue';
import { ConfirmButtonStatus } from '../../../utils/constants';
import { useI18n } from 'vue-i18n';
import { parsingMnemonics } from '../../Mobile/login/account/ImportUserBusiness';
import TerminusPageTitle from '../../../components/common/TerminusPageTitle.vue';
import { importUser } from '../../Mobile/connect/BindTerminusBusiness';
import { TerminusDefaultDomain, TerminusInfo } from '@bytetrade/core';
import axios from 'axios';
import {
	notifyWarning,
	notifyFailed
} from '../../../utils/notifyRedefinedUtil';

const $q = useQuasar();
const router = useRouter();
const mnemonic = ref<string>('');
const { t } = useI18n();

async function onConfirm() {
	btnStatusRef.value = ConfirmButtonStatus.disable;
	$q.loading.show();
	await parsingMnemonics(mnemonic.value, {
		async onSuccess(data: any) {
			if (data) {
				try {
					const array: string[] = data.split('@');
					let baseUrl = '';
					if (array.length == 2) {
						baseUrl = 'https://auth.' + array[0] + '.' + array[1] + '/';
					} else {
						baseUrl =
							'https://auth.' + array[0] + '.' + TerminusDefaultDomain + '/';
					}
					const info: TerminusInfo | null = await getTerminusInfo(baseUrl);
					if (info && info.wizardStatus == 'completed') {
						await importUser(data, mnemonic.value);
						router.push({ path: '/connectLoading' });
					} else {
						throw Error('Terminus not complete, please use another one');
					}
				} catch (e) {
					$q.loading.hide();
					notifyFailed(e.message);
				}
			} else {
				notifyWarning(
					'The corresponding DID for this mnemonic phrase does \
        not have a corresponding Terminus Name, so it cannot be imported. \
        Please try importing it using a mobile device and apply for a Terminus Name according to the prompts.'
				);
			}
		},
		onFailure(message: string) {
			notifyFailed(message);
		}
	});
	btnStatusRef.value = ConfirmButtonStatus.normal;
	$q.loading.hide();
}

const btnStatusRef = ref<ConfirmButtonStatus>(ConfirmButtonStatus.disable);

const mnemonicUpdate = (value: string) => {
	mnemonic.value = value;
	const masterPasswordArray = mnemonic.value.split(' ');
	if (
		masterPasswordArray.length !== 12 ||
		masterPasswordArray.find((e) => e.length === 0) !== undefined
	) {
		btnStatusRef.value = ConfirmButtonStatus.disable;
		return;
	}
	btnStatusRef.value = ConfirmButtonStatus.normal;
};

async function getTerminusInfo(baseUrl: string): Promise<TerminusInfo | null> {
	try {
		const data: TerminusInfo = await axios.get(
			baseUrl + 'bfl/info/v1/terminus-info',
			{
				timeout: 5000
			}
		);
		return data;
	} catch (e) {
		console.log(e);
		return null;
	}
}
</script>

<style lang="scss" scoped>
.input-mnemonic-page {
	width: 100%;
	height: 100%;
	background: $background;
	padding-top: 20px;
	padding-left: 32px;
	padding-right: 32px;
	position: relative;

	&__mnemonic {
		margin-top: 32px;
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
