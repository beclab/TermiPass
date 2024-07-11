<template>
	<div class="bind_org_vc_root">
		<BindTerminusVCContent class="bind-terminus-vc-root">
			<template v-slot:desc>
				{{ t('choose_to_join_existing_org') }}
			</template>
			<template v-slot:content>
				<account-operations
					class="q-mt-lg"
					image-name="groups"
					:title="t('join_an_existing_organization')"
					@click="joinAnOrg"
				/>

				<account-operations
					class="q-mt-md"
					image-name="add"
					:title="t('create_a_new_organization')"
					@click="createAOrg"
				/>
			</template>
		</BindTerminusVCContent>
		<terminus-title-bar style="position: absolute; top: 0" :translate="true" />
		<div class="bind_org_vc_root__img row items-center justify-center">
			<TerminusChangeUserHeader />
		</div>
	</div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

import BindTerminusVCContent from './BindTerminusVCContent.vue';
import AccountOperations from '../../../../components/common/AccountOperations.vue';
import { useRouter } from 'vue-router';
import TerminusTitleBar from '../../../../components/common/TerminusTitleBar.vue';
import TerminusChangeUserHeader from '../../../../components/common/TerminusChangeUserHeader.vue';
import { useUserStore } from '../../../../stores/user';

const { t } = useI18n();
const router = useRouter();
const userStore = useUserStore();

const joinAnOrg = async () => {
	if (!(await userStore.unlockFirst())) {
		return;
	}
	router.push({
		path: '/JoinOrganization'
	});
};

const createAOrg = async () => {
	if (!(await userStore.unlockFirst())) {
		return;
	}
	router.push({
		path: '/CloudDomainManage'
	});
};
</script>

<style lang="scss" scoped>
.bind_org_vc_root {
	width: 100%;
	height: 100%;
	position: relative;

	.bind-terminus-vc-root {
		width: 100%;
		height: 100%;
	}

	&__img {
		width: 100%;
		height: 40px;
		position: absolute;
		right: 20px;
		top: 8px;
	}
}
</style>
