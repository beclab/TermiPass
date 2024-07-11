<template>
	<div class="mobile-title text-subtitle1 text-ink-1" v-if="isMobile">
		{{ label }}
	</div>

	<div
		class="bar q-mb-md q-px-sm bg-background-3 row items-center justify-between"
		v-else
	>
		<q-icon v-if="icon" color="ink-1" :name="icon" size="18px" />
		<div
			class="title text-subtitle3 col text-ink-1"
			:class="titAlign ? titAlign : 'text-left'"
		>
			{{ label }}
		</div>
		<q-space />
		<q-btn dense flat icon="close" color="ink-3" @click="onCancel">
			<q-tooltip>{{ t('buttons.close') }}</q-tooltip>
		</q-btn>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';

defineProps({
	label: {
		type: String,
		default: '',
		required: false
	},
	icon: {
		type: String,
		default: '',
		required: false
	},
	titAlign: {
		type: String,
		default: 'left',
		required: false
	}
});

const $q = useQuasar();
const isMobile = ref(process.env.PLATFORM == 'MOBILE' || $q.platform.is.mobile);
const emit = defineEmits(['close']);
const { t } = useI18n();

const onCancel = () => {
	emit('close');
};
</script>

<style scoped lang="scss">
.mobile-title {
	color: $ink-1;
	text-align: center;
	margin: 20px 0;
}
</style>
