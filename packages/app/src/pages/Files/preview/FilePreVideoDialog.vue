<template>
	<q-dialog
		v-model="dialog"
		persistent
		:maximized="maximizedToggle"
		transition-show="slide-up"
		transition-hide="slide-down"
	>
		<div id="video-previewer">
			<div class="header row items-center justify-between">
				<div class="title text-ink-on-brand text-h5">{{ title }}22</div>
				<div>
					<q-btn
						dense
						flat
						color="white"
						icon="sym_r_close"
						@click="close"
						v-close-popup
					>
					</q-btn>
				</div>
			</div>
			<div class="content bg-background-2">
				<BtLoading
					:show="true"
					v-if="store.loading"
					textColor="#4999ff"
					color="#4999ff"
					text=""
					backgroundColor="rgba(0, 0, 0, 0)"
				>
				</BtLoading>
				<template v-else>
					<file-video-preview />
				</template>
			</div>
		</div>
	</q-dialog>
</template>

<script setup lang="ts">
import HeaderBar from '../../../components/files/header/HeaderBar.vue';
import Action from '../../../components/files/header/Action.vue';

import { useDataStore } from '../../../stores/data';
import FileVideoPreview from '../common-files/FileVideoPreview.vue';

import { onMounted, onUnmounted, ref, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import { format, useQuasar } from 'quasar';

import { checkSeahub } from '../../../utils/file';

const dialog = ref(false);

const maximizedToggle = ref(true);

const { humanStorageSize } = format;

const store = useDataStore();

const title = ref(store.req.name);

const isDark = ref(false);

const $router = useRouter();

const size = ref(humanStorageSize(store.req.size ?? 0));

const $q = useQuasar();

onBeforeMount(() => {
	store.preview.isShow = true;
});

onMounted(() => {
	isDark.value = false;
});

const close = () => {
	if (!checkSeahub(store.req.path)) {
		$router.back();
		store.resetRequest();
	} else {
		store.resetRequest();
	}
	dialog.value = false;
};

onUnmounted(() => {
	store.preview.fullSize = false;
	store.preview.isShow = false;
});

const showOperation = () => {
	if (store.preview.isEditEnable) {
		if (!store.preview.isEditing) {
			store.preview.isEditing = true;
		} else {
			store.preview.isSaving = true;
		}
	}
};
</script>

<style scoped lang="scss">
#video-previewer {
	position: relative;
	background-color: rgba(0, 0, 0, 0);
	padding: 12px;
	height: 100%;
}

#video-previewer .preview {
	text-align: center;
	height: 100%;
}

#video-previewer .content {
	height: 100%;
	border-radius: 12px;
	overflow: hidden;
}

.header {
	position: absolute;
	width: calc(100% - 24px);
	height: 56px;
	z-index: 1;
	padding: 0 12px;
}
</style>
