<template>
	<div class="float-wrap">
		<div
			class="float"
			:style="{ background: state != 'Failed' ? '#ADB1FF' : '#FFBBC8' }"
		></div>
		<div
			class="float"
			:style="{ background: state != 'Failed' ? '#FFBBC8' : '#FFBBC8' }"
		></div>
	</div>

	<div
		v-if="
			(wizardStatus == 'wait_activate_network' ||
				wizardStatus == 'network_activating') &&
			state != 'Failed'
		"
		class="column items-center"
	>
		<div class="boot_justify">
			<animationPage
				:picture="network_waikuang_image"
				:certificate="network_image"
				:isAnimated="true"
			/>
		</div>
		<div class="wizard-content__title">
			{{ t('network_configuration') }}
		</div>
		<div class="wizard-content__detail">
			{{ t('network_configuration_introduce') }}
		</div>
	</div>
	<div
		class="column items-center"
		style="word-wrap: break-word min-height:auto"
		v-else
	>
		<div class="boot_justify">
			<q-img
				src="../../../../assets/wizard/failed.svg"
				class="wizard-content__image"
			/>
		</div>
		<div class="wizard-content__title">
			{{ t('https_certificate_issuance_failed') }}
		</div>
		<div class="wizard-content__detail">
			{{ t('https_certificate_issuance_failed_please_try_again') }}
		</div>

		<div class="wizard-content__retry">
			<q-btn
				class="wizard-content__retry__btn row items-center justify-center"
				flat
				padding="0px"
				no-caps
				@click="onFailed"
			>
				<q-icon name="sync" size="15px" class="q-mr-xs" />
				<div>
					{{ t('retry') }}
				</div>
			</q-btn>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, PropType } from 'vue';
import axios from 'axios';
import animationPage from './animation.vue';
import network_image from '../../../../assets/wizard/network.png';
import network_waikuang_image from '../../../../assets/wizard/network_waikuang.png';
import { WizardInfo } from './wizard';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
	wizard: {
		type: Object as PropType<WizardInfo>,
		required: true
	},
	baseURL: {
		type: String,
		required: true
	},
	wizardStatus: {
		type: String,
		required: true
	}
});

const state = ref<string | null>(null);
let interval: any = null;

const emit = defineEmits(['onNetworkSetup']);

async function checkHttpsCertificateProgress() {
	try {
		const data: any = await axios.get(
			props.baseURL + '/bfl/settings/v1alpha1/ssl/task-state',
			{}
		);

		if (
			data == "<h1><a href='https://www.bytetradelab.io/'>Bytetrade</a></h1>"
		) {
			state.value = 'Succeeded';
		} else if (data.state == 4) {
			state.value = 'Succeeded';
		} else if (data.state == 2) {
			state.value = 'Running';
		} else if (data.state == 5) {
			state.value = 'CheckL4Proxy';
		} else if (data.state == 6) {
			state.value = 'CheckFrpAgent';
		} else if (data.state == 7) {
			state.value = 'GenerateCert';
		} else if (data.state == 8) {
			state.value = 'ConfigureIngressHTTPs';
		} else if (data.state == 9) {
			state.value = 'CheckTunnel';
		} else if (data.state == 3) {
			state.value = 'Failed';
		} else if (data.state == 1) {
			state.value = 'Pending';
		}
	} catch (e) {
		state.value = null;
	}
}

function onFailed() {
	emit('onNetworkSetup');
}

onMounted(async () => {
	interval = setInterval(async () => {
		checkHttpsCertificateProgress();
	}, 5 * 1000);
	checkHttpsCertificateProgress();
});

onUnmounted(() => {
	if (interval) {
		clearInterval(interval);
	}
});
</script>
