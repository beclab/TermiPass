<template>
	<div class="bind-terminus-vc-root">
		<BindTerminusVCContent class="bind-terminus-vc-root">
			<template v-slot:desc>
				{{ t('please_select_vc_desc') }}
			</template>
			<template v-slot:content>
				<div
					class="bind-terminus-vc-root__btnbg bind-terminus-vc-root__personal text-subtitle2 q-mt-lg"
				>
					<q-btn
						flat
						@click="onCustomer()"
						no-caps
						class="bind-terminus-vc-root__btnbg__btn row items-center justify-center"
					>
						<q-icon
							name="sym_r_person"
							size="20px"
							class="q-mr-sm"
							color="grey-10"
						/>
						<div style="font-weight: 500">
							{{ t('bind_personal_vc') }}
						</div>
					</q-btn>
				</div>

				<div
					class="bind-terminus-vc-root__btnbg bind-terminus-vc-root__org text-ink-1 q-mt-md"
				>
					<q-btn
						flat
						@click="onOrg()"
						no-caps
						class="bind-terminus-vc-root__btnbg__btn row items-center justify-center"
					>
						<q-icon name="sym_r_groups" size="20px" class="q-mr-sm" />
						<div style="font-weight: 400">
							{{ t('bind_organization_vc') }}
						</div>
					</q-btn>
				</div>
			</template>
		</BindTerminusVCContent>

		<div class="bind-terminus-vc-root__img row items-center justify-center">
			<TerminusChangeUserHeader />
		</div>
		<TerminusExportMnemonicRoot class="bind-terminus-vc-root__export" />
	</div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import BindTerminusVCContent from './BindTerminusVCContent.vue';
import TerminusExportMnemonicRoot from '../../../../components/common/TerminusExportMnemonicRoot.vue';
import TerminusChangeUserHeader from '../../../../components/common/TerminusChangeUserHeader.vue';

const { t } = useI18n();
const router = useRouter();

const onCustomer = () => {
	enterVCIntroduce(true);
};

const onOrg = () => {
	enterVCIntroduce(false);
};

const enterVCIntroduce = (isPersonal: boolean) => {
	router.push({ path: `/BindVCIntroduce/${isPersonal}` });
};
</script>

<style lang="scss" scoped>
.bind-terminus-vc-root {
	width: 100%;
	height: 100%;
	position: relative;

	&__img {
		width: 100%;
		height: 40px;
		position: absolute;
		right: 20px;
		top: 20px;
	}

	&__export {
		position: absolute;
		bottom: 48px;
	}

	&__btnbg {
		width: 100%;
		height: 48px;
		text-align: center;

		&__btn {
			width: 100%;
			height: 100%;
		}
	}

	&__personal {
		border-radius: 8px;
		background: $yellow;
		color: $grey-10;
	}

	&__org {
		border-radius: 8px;
		border: 1px solid $separator;
		color: $ink-2;
	}
}
</style>
