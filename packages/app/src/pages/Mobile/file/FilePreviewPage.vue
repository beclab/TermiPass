<template>
	<q-dialog
		ref="dialogRef"
		persistent
		:maximized="maximizedToggle"
		transition-show="slide-up"
		transition-hide="slide-down"
	>
		<div class="preview-list-root" :class="isDark ? 'bg-dark-page' : ''">
			<terminus-title-bar
				v-if="!titleBarHidden"
				:title="title"
				:is-dark="isDark"
				:right-icon="rightIcon"
				:hook-back-action="true"
				@on-return-action="showOperation"
			/>
			<div :class="titleBarHidden ? 'content-full' : 'content'">
				<div
					v-if="store.loading"
					style="width: 100%; height: 100%"
					class="row items-center justify-center"
				>
					<q-spinner-dots color="primary" size="3em" />
				</div>
				<component v-else-if="currentView" :is="currentView" />
			</div>
		</div>
	</q-dialog>
</template>

<script setup lang="ts">
import FileEditor from '../../Files/common-files/FileEditor.vue';
import FileUnavailable from '../../Files/common-files/FileUnavailable.vue';
import FileMediumPreview from './FileMediumPreview.vue';
import FilePDFPreview from './FilePDFPreview.vue';
import TerminusTitleBar from '../../../components/common/TerminusTitleBar.vue';
import { useDataStore } from '../../../stores/data';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { computed } from 'vue';
import { useDialogPluginComponent, useQuasar } from 'quasar';
import {
	ScreenOrientation,
	OrientationLockType
} from '@capacitor/screen-orientation';
import { useFilesStore } from '../../../stores/files';
import { busOn } from '../../../utils/bus';
import { busOff } from '../../../utils/bus';

const title = ref('');

const isDark = ref(false);

const rightIcon = ref('sym_r_more_horiz');

const store = useDataStore();
const filesStore = useFilesStore();

const $q = useQuasar();

const maximizedToggle = ref(true);

const { dialogRef, onDialogCancel } = useDialogPluginComponent();

const showOperation = () => {
	onDialogCancel();
};

const currentView = ref();

const screenOrientation = ref<OrientationLockType>('portrait');

watch(
	() => filesStore.previewItem,
	(newVal) => {
		if (newVal.type == undefined) {
			return null;
		}

		currentView.value = undefined;

		if (newVal.name) {
			title.value = newVal.name as string;
		}

		if (
			newVal.type === 'text' ||
			newVal.type === 'txt' ||
			newVal.type === 'textImmutable'
		) {
			store.preview.isEditEnable = true;
			return (currentView.value = FileEditor);
		} else {
			rightIcon.value = '';
			store.preview.isEditEnable = false;
			if (
				newVal.type == 'image' ||
				newVal.type == 'video' ||
				newVal.type == 'audio'
			) {
				isDark.value = true;
				return (currentView.value = FileMediumPreview);
			}

			if (newVal.type == 'pdf') {
				return (currentView.value = FilePDFPreview);
			}

			return (currentView.value = FileUnavailable);
		}
	},
	{
		deep: true
	}
);

onMounted(() => {
	if ($q.platform.is.nativeMobile) {
		ScreenOrientation.addListener('screenOrientationChange', (origin) => {
			screenOrientation.value = origin.type;
		});
	}

	isDark.value = false;
});

const titleBarHidden = computed(function () {
	return (
		$q.platform.is.nativeMobile &&
		screenOrientation.value.startsWith('landscape')
	);
});

watch(
	() => store.preview,
	() => {
		if (store.preview.isEditEnable) {
			if (store.preview.isEditing) {
				rightIcon.value = 'sym_r_save';
			} else {
				rightIcon.value = 'sym_r_edit_square';
			}
		}
	},
	{ deep: true }
);

onMounted(() => {
	busOn('dialogDismiss', () => {
		onDialogCancel();
	});
});

onUnmounted(() => {
	busOff('dialogDismiss');
});
</script>

<style scoped lang="scss">
.preview-list-root {
	width: 100%;
	height: 100%;
	background-color: $background-1;

	.content {
		width: 100%;
		height: calc(100% - 56px);
	}

	.content-full {
		width: 100%;
		height: 100%;
	}
}

.bg-dark-page {
	background-color: $shadow-color;
}
</style>
