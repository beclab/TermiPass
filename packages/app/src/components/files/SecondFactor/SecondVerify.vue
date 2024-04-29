<template>
	<q-dialog ref="dialogRef" class="factor-box" v-model="show">
		<q-card class="factor-card row items-center justify-center">
			<OneTimePasswordMethod
				ref="onetimeRef"
				:digits="infitotp.digits"
				:period="infitotp.period"
				@handleOnChange="handleOnChange"
			/>

			<div
				class="login-btn text-subtitle1"
				:class="passwordErr ? 'errShock' : ''"
				@click="onLogin"
			>
				{{ t('submit') }}
			</div>
		</q-card>
	</q-dialog>
</template>
<script lang="ts">
import {
	defineComponent,
	ref,
	onMounted,
	onUnmounted,
	getCurrentInstance
} from 'vue';
import { useRouter } from 'vue-router';
import { Loading, useDialogPluginComponent } from 'quasar';
import OneTimePasswordMethod from './OneTimePasswordMethod.vue';
import { useSecondVerifyStore } from '../../../stores/second';
import { notifyFailed } from '../../../utils/notifyRedefinedUtil';
import { useI18n } from 'vue-i18n';

export default defineComponent({
	components: {
		OneTimePasswordMethod
	},
	props: ['request'],
	setup(props) {
		const router = useRouter();
		const secondVerifyStore = useSecondVerifyStore();
		const userinfo = ref();
		const infitotp = ref({
			digits: 6,
			period: 30
		});
		const oneTimePasswordMethod = ref();
		const passwordErr = ref(false);
		const { proxy } = getCurrentInstance() as any;

		const { t } = useI18n();

		const show = ref(true);
		const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
			useDialogPluginComponent();

		const handleOnChange = (value: any) => {
			oneTimePasswordMethod.value = value;
		};

		const onLogin = async () => {
			if (
				!oneTimePasswordMethod.value ||
				(oneTimePasswordMethod.value && oneTimePasswordMethod.value?.length < 6)
			) {
				return false;
			}

			Loading.show();
			const responseURL = props.request.responseURL;
			try {
				const res: any = await secondVerifyStore.cert_secondfactor_totp(
					oneTimePasswordMethod.value,
					responseURL
				);

				let redirect = res?.data?.data?.redirect;
				if (redirect) {
					let path =
						'/files' + redirect.slice(redirect.indexOf('resources') + 9);
					router.push({ path });
					onDialogOK({ redirect });
				}
			} catch (err) {
				passwordErr.value = true;
				setTimeout(() => {
					passwordErr.value = false;
				}, 2000);
				notifyFailed((err as Error).message);
			} finally {
				Loading.hide();
				await handleClearInput();
			}
		};

		const handleClearInput = () => {
			oneTimePasswordMethod.value = null;
			proxy.$refs['onetimeRef'].clearInput();
		};

		const keydownEnter = (event: any) => {
			if (event.keyCode !== 13) return false;
			onLogin();
		};

		onMounted(() => {
			window.addEventListener('keydown', keydownEnter);
		});

		onUnmounted(() => {
			window.removeEventListener('keydown', keydownEnter);
		});

		return {
			userinfo,
			infitotp,
			passwordErr,
			show,
			dialogRef,
			onLogin,
			handleOnChange,
			handleClearInput,
			onDialogHide,
			onDialogOK,
			onDialogCancel,
			t
		};
	}
});
</script>
<style lang="scss">
.factor-box {
	display: flex;
	align-items: center;
	justify-content: center;

	.factor-card {
		width: 480px;
		padding: 20px;
		box-shadow: none;
		background-color: $white;
		border-radius: 20px;

		.login-btn {
			width: 120px;
			height: 48px;
			line-height: 48px;
			text-align: center;
			color: $title;
			background: $white;
			box-shadow: 0px 2px 12px 0px $grey-2;
			opacity: 1;
			border-radius: 8px;
		}

		.errShock {
			animation-delay: 0s;
			animation-name: shock;
			animation-duration: 0.1s;
			animation-iteration-count: 3;
			animation-direction: normal;
			animation-timing-function: linear;
		}

		@keyframes shock {
			0% {
				margin-left: 0px;
				margin-right: 5px;
			}
			100% {
				margin-left: 5px;
				margin-right: 0px;
			}
		}
	}
}
</style>
