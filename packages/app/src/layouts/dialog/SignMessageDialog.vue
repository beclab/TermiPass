<template>
	<q-dialog
		ref="root"
		@hide="onDialogHide"
		maximized
		transition-show="slide-up"
		transition-hide="slide-down"
	>
		<q-card class="q-dialog-plugin column root">
			<div
				class="header row justify-between items-center"
				:style="
					$q.platform.is.nativeMobile && $q.platform.is.android
						? 'margin-top:30px;'
						: ''
				"
			>
				<div class="row justify-start items-center">
					<div
						class="icon-container column justify-center items-center"
						@click="onCancelClick"
					>
						<q-icon name="sym_r_close" size="24px" />
					</div>
				</div>
			</div>

			<div class="sign-content-container column items-center">
				<div class="sign-content-container__content column items-center">
					<div
						class="row items-center justify-center"
						style="width: 124px; height: 124px; margin-top: 64px"
					>
						<q-img
							:src="
								body.app?.icon
									? body.app?.icon
									: defaultMessageInfo(body.event).imgPath
							"
							width="90px"
							height="90px"
							noSpinner
							style="border-radius: 50%"
						/>
					</div>

					<div class="text-color-title text-h5 title">
						{{
							body.notification?.title || defaultMessageInfo(body.event).title
						}}
					</div>

					<div class="text-color-sub-title text-body3 content">
						{{
							body.notification?.body || defaultMessageInfo(body.event).content
						}}
					</div>
				</div>

				<q-btn
					class="confirm row items-center justify-center"
					@click="onOKClick"
					flat
					no-caps
					:disable="!confirmEnable"
				>
					<q-spinner-dots color="sub-title" v-if="!confirmEnable" />
					<div v-else>{{ t('confirm') }}</div>
				</q-btn>
				<q-btn class="cancel" flat no-caps @click="onCancelClick">
					<div>{{ t('cancel') }}</div>
				</q-btn>
			</div>
		</q-card>
	</q-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, PropType, onUnmounted, onBeforeUnmount } from 'vue';
import { useQuasar } from 'quasar';
import { app } from '../../globals';
import { useUserStore } from '../../stores/user';
import { MessageBody } from '@bytetrade/core';
import { getPrivateJWK, getDID, getEthereumAddress } from '../../did/did-key';
import {
	ItemTemplate,
	ITEM_TEMPLATES,
	Field,
	UserItem,
	VaultType
} from '@didvault/sdk/src/core';
import {
	signJWS,
	requestVC,
	signStatement,
	mnemonicToKey,
	defaultDriverPath
} from './sign';
import { PrivateJwk, Submission } from '@bytetrade/core';
import { submitPresentation } from '../../pages/Mobile/vc/vcutils';
import { busOn, busOff } from '../../utils/bus';
import axios from 'axios';
import { notifySuccess, notifyFailed } from '../../utils/notifyRedefinedUtil';
import { useI18n } from 'vue-i18n';
import { i18n } from '../../boot/i18n';
import { StatusBar } from '@capacitor/status-bar';
import { useMenuStore } from '../../stores/menu';
import { generateStringEllipsis } from '../../utils/utils';
import { getRequireImage } from '../../utils/imageUtils';

const props = defineProps({
	body: {
		type: Object as PropType<MessageBody>,
		required: true
	}
});
const $q = useQuasar();
const menuStore = useMenuStore();

const sign_id = props.body.message?.id;

const emit = defineEmits(['hide']);
const root = ref<any>(null);

const confirmEnable = ref(true);

const userStore = useUserStore();

const { t } = useI18n();

const onDialogHide = () => {
	emit('hide');
};

onMounted(() => {
	if ($q.platform.is.android) {
		StatusBar.setOverlaysWebView({ overlay: true });
	}
	menuStore.changeSafeArea(false);
	busOn('cancel_sign', (data) => {
		if (data == sign_id) {
			emit('hide');
		}
	});
});

onUnmounted(() => {
	busOff('cancel_sign');
});

onBeforeUnmount(() => {
	if ($q.platform.is.android) {
		StatusBar.setOverlaysWebView({ overlay: false });
	}
	menuStore.changeSafeArea(true);
});

const onOKClick = async () => {
	confirmEnable.value = false;

	try {
		let user: UserItem = userStore.users!.items.get(userStore.current_id!)!;

		let did = await getDID(user.mnemonic);
		let privateJWK: PrivateJwk | undefined = await getPrivateJWK(user.mnemonic);
		const owner = await getEthereumAddress(user.mnemonic);

		if (!did) {
			throw new Error(t('errors.get_did_failure'));
		}
		if (!privateJWK) {
			throw new Error(t('errors.get_privatejwk_failure'));
		}

		if (props.body.message?.sign?.sign_vc) {
			await requestVCVP(
				user,
				did,
				privateJWK,
				owner,
				props.body.message?.sign?.sign_vc.type,
				props.body.message?.sign?.sign_vc.name,
				props.body.message?.sign?.sign_vc.request_path,
				props.body.message?.sign?.sign_vc.data
			);
			const url = props.body.message?.sign?.callback_url;
			const postData = {
				id: props.body.message?.id
			};
			await axios.post(url!, postData);
		} else {
			let eth721Sign = '';
			if (props.body.message?.sign?.sign_eth) {
				const ownerKey = mnemonicToKey(user.mnemonic, defaultDriverPath(0));
				eth721Sign = await signStatement(
					props.body.message?.sign?.sign_eth.domain,
					props.body.message?.sign?.sign_eth.types,
					props.body.message?.sign?.sign_eth.data,
					props.body.message?.sign?.sign_eth.primaryType,
					ownerKey
				);
			}

			let body = { ...props.body.message?.sign?.sign_body };
			if (eth721Sign) {
				body['eth721_sign'] = eth721Sign;
			}

			const jws = await signJWS(did, body, privateJWK);

			const url = props.body.message?.sign?.callback_url;
			const postData = {
				id: props.body.message?.id,
				jws,
				did,
				...body
			};
			await axios.post(url!, postData);
		}
		notifySuccess(t('sign_success'));
		emit('hide');
	} catch (e) {
		notifyFailed(e.message);
	} finally {
		confirmEnable.value = true;
		$q.loading.hide();
	}
};

const onCancelClick = () => {
	emit('hide');
};

async function requestVCVP(
	user: UserItem,
	did: string,
	privateJWK: PrivateJwk,
	owner: string,
	vc_type: string,
	vc_name: string,
	vc_request_path: string,
	vc_sign_data: any
) {
	const vcResult = await requestVC(
		did,
		vc_type,
		vc_request_path,
		vc_sign_data,
		privateJWK
	);

	const vault = app.mainVault;
	if (!vault) {
		throw new Error(t('errors.main_vault_is_null'));
	}

	const template: ItemTemplate | undefined = ITEM_TEMPLATES.find(
		(template) => template.id === 'vc'
	);
	if (!template) {
		throw new Error(t('errors.template_is_null'));
	}
	template.fields[0].value = vc_name;
	template.fields[1].value = vcResult.manifest;
	template.fields[2].value = vcResult.verifiable_credential;

	await app.createItem({
		name: vc_name,
		vault,
		fields: template?.fields.map(
			(f) => new Field({ ...f, value: f.value || '' })
		),
		tags: [],
		icon: template?.icon,
		type: VaultType.VC
	});

	const submission: Submission = await submitPresentation(
		'NFT',
		did,
		privateJWK,
		vcResult.verifiable_credential.substring(
			0,
			vcResult.verifiable_credential.length
		),
		owner,
		null
	);

	if (!submission || submission.status !== 'approved') {
		throw new Error(submission.reason);
	}
	return '';
}

const defaultMessageInfo = (eventType: string) => {
	const usestore = useUserStore();
	let title = '';
	let content = '';
	let imgPath = '';
	if (eventType == 'login_cloud') {
		title = i18n.global.t('login_terminus_space');
		content = i18n.global.t('login_terminus_space_desc', {
			did: usestore.current_user?.name
				? usestore.current_user?.name
				: generateStringEllipsis(usestore.current_user?.id || '', 17) //DID/Terminus Nameusestore
		});
		imgPath = getRequireImage('cloud/login/cloud-logo.png');
	}
	return {
		title,
		content,
		imgPath
	};
};
</script>

<style lang="scss" scoped>
.root {
	border-radius: 10px;
	padding: 10px 20px;
	background: $grey-1;
	.header {
		height: 40px;
		width: 100%;
		text-align: center;
		padding: 0;
		position: relative;

		.icon-container {
			width: 32px;
			height: 32px;
		}
	}

	.sign-content-container {
		background: $white;
		height: calc(100% - 81px);
		border-radius: 12px;
		width: 100%;

		&__content {
			width: 100%;
			height: calc(100% - 120px);

			.title {
				text-align: center;
			}
			.content {
				text-align: center;
				width: calc(100% - 64px);
			}
		}

		.confirm {
			width: 207px;
			height: 48px;
			background: $yellow;
			border-radius: 8px;

			&:before {
				box-shadow: none;
			}
		}

		.cancel {
			width: 46%;
			height: 48px;
			padding-top: 10px;
			border-radius: 10px;
			box-shadow: none;
			color: $blue-4;

			&:before {
				box-shadow: none;
			}
		}
	}

	.password {
		width: 100%;
		margin-top: 10px;
		border: 1px solid $grey-2;
		border-radius: 10px;
		padding: 0 10px;
	}

	.button {
		width: 100%;
		margin-top: 20px;
	}
}
</style>
