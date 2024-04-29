<template>
	<div class="walletconnect_root">
		<div class="text-color-title text-subtitle1 title">Binding DID</div>
		<div class="row justify-center">
			<qrcode-vue :value="url" :size="400"> </qrcode-vue>
		</div>
		<div class="text-color-sub-detail text-body3 bottom-content">
			{{ url }}
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import QrcodeVue from 'qrcode.vue';
import { Encoder } from '@bytetrade/core';
import { useUserStore } from '../../stores/user';

export default defineComponent({
	name: 'BindingPage',
	components: {
		QrcodeVue
	},
	setup() {
		// const $q = useQuasar();
		const userStore = useUserStore();
		console.log('userStore.terminusInfo ==>');
		console.log(userStore.terminusInfo());

		const options = ref([
			{
				value: 'QRCode',
				label: 'QR Code'
			},
			{
				value: 'URL',
				label: 'URL'
			}
		]);

		const tab = ref(options.value[0].value);

		const wizard = {
			url: process.env.PL_SERVER_URL || window.location.origin + '/server',
			username: userStore.terminusInfo()?.terminusName,
			password: '123456',
			system: {
				language: 'English',
				location: 'Singapore'
			},
			network: {
				use_frps: false,
				external_ip: '127.0.0.1',
				frps_region: 'Virginia'
			}
		};
		console.log(wizard);

		const url = ref<string>(
			'active_vault://' + Encoder.stringToBase64Url(JSON.stringify(wizard))
		);

		//const sso_token = ref<string>(ostoken);
		//const bfl_token = ref<string>('');

		//if (base_url.startsWith('http://localhost')) {
		// if (process.env.PL_SERVER_URL) {
		// 	// token.value =
		// 	// 	'test-token-test-token-test-token-test-token-test-token-test-token-test-token-test-token-test-token-test-token-test-token-test-token-test-token-test-token-test-token-test-token-test-token-test-token-test-token-test-token-test-token-test-token-test-token-test-token-test-token-test-token-test-token-test-token-test-token-test-token-test-token-test-token-test-token-test-token-test-token-test-token';
		// 	//sso_token.value = 'GDbSOW6E#2lH5##i8fotFrqpYLToslqt'
		// 	bfl_token.value =
		// 		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2Nzg3NzU0OTQsImlhdCI6MTY3ODc2ODI5NCwiaXNzIjoia3ViZXNwaGVyZSIsInN1YiI6ImxpdXl1IiwidG9rZW5fdHlwZSI6ImFjY2Vzc190b2tlbiIsInVzZXJuYW1lIjoibGl1eXUifQ.Yr7OhrQ39OXmesVJldORZ34UsFZpiiCWpssKlRxEOR4';
		// }

		// const url = ref<string>(
		// 	base_url +
		// 		'?bfl_token=' +
		// 		bfl_token.value +
		// 		'&username=liuyu&password=Test123456'
		// );

		return {
			url,
			options,
			tab
		};
	}
});
</script>

<style lang="scss" scoped>
.walletconnect_root {
	width: 100%;
	.title {
		text-align: center;
		width: 100%;
	}

	.bottom-content {
		width: 100%;
		line-height: 18px;
		word-break: break-all;
		word-wrap: break-word;
		text-align: left;
	}
}
</style>
