<template>
	<div class="create-new-folder-root">
		<back-title-bar
			:title="isBoard ? 'Create New Board' : 'Create New Folder'"
		/>
		<div class="create-folder-content">
			<terminus-edit
				:label="t('Edit Title')"
				:show-password-img="false"
				input-color="white"
				@on-text-change="titleUpdate"
			/>
			<div class="text-body2 item-title" v-if="isBoard">Description</div>
			<div class="desc-bg" v-if="isBoard">
				<q-input
					v-model="descRef"
					borderless
					bg-color="transparent"
					type="textarea"
					class="message-input"
					:placeholder="t('desc_this_board')"
					input-class="text-color-FFFFFF"
				/>
			</div>
		</div>
		<div class="bottom-bg bottom-bg-height">
			<confirm-button
				class="confirm-button"
				:btn-title="t('confirm')"
				@onConfirm="confirmAction"
				:btn-status="btnStatusRef"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import BackTitleBar from '../../../components/common/BackTitleBar.vue';
import { ref } from 'vue';
import { ConfirmButtonStatus } from '../../../utils/constants';
import TerminusEdit from '../../../components/common/TerminusEdit.vue';
import ConfirmButton from '../../../components/common/ConfirmButton.vue';
// import { useRssStore } from '../../../stores/rss';
import { useQuasar } from 'quasar';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { notifyFailed } from '../../../utils/notifyRedefinedUtil';

const btnStatusRef = ref<ConfirmButtonStatus>(ConfirmButtonStatus.disable);
const { t } = useI18n();

// const rssStore = useRssStore();
const router = useRouter();
const route = useRoute();

const descRef = ref('');

const isBoard = ref(route.query.isBoard !== undefined);

const $q = useQuasar();

const confirmAction = async () => {
	if (!titleRef.value) {
		return;
	}
	$q.loading.show();
	try {
		const data = await sendCreadRequest();
		$q.loading.hide();
		if (data === undefined) {
			notifyFailed(
				isBoard.value ? 'Create board error' : 'Create folder error'
			);
		} else {
			router.go(-1);
		}
	} catch (error) {
		$q.loading.hide();
		console.log(error);
	}
};

const sendCreadRequest = async () => {
	// if (isBoard.value) {
	// 	return await rssStore.createBoard({
	// 		title: titleRef.value,
	// 		description: descRef.value
	// 	});
	// }
	// return await rssStore.createCategory(titleRef.value);
};

const titleRef = ref('');

const titleUpdate = (title: string) => {
	titleRef.value = title;
	calButonEnable();
};

const calButonEnable = () => {
	btnStatusRef.value =
		titleRef.value.length > 0
			? ConfirmButtonStatus.normal
			: ConfirmButtonStatus.disable;
};
</script>

<style scoped lang="scss">
.create-new-folder-root {
	width: 100%;
	height: 100%;

	.create-folder-content {
		width: 100%;
		height: calc(100% - 144px);
		padding: 16px 24px;
		overflow-y: scroll;

		.item-title {
			margin-top: 16px;
			margin-bottom: 8px;
		}
	}

	.desc-bg {
		width: 100%;

		.message-input {
			resize: none;
			margin-top: -6px;
			margin-left: 16px;
			margin-right: 16px;
			max-width: calc(100% - 32px);
			width: calc(100% - 32px);
		}
	}

	.bottom-bg-height-ios {
		height: calc(94px + env(safe-area-inset-bottom));
	}

	.bottom-bg-height {
		height: 94px;
	}

	.bottom-bg {
		width: 100%;
		padding-top: 16px;
	}

	.confirm-button {
		padding-left: 24px;
		padding-right: 24px;
	}
}
</style>
