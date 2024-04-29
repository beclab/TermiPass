<template>
	<div class="mobile-title text-subtitle1" v-if="isMobile">
		{{ label }}
	</div>

	<q-bar class="bar q-mb-md" v-else>
		<q-icon v-if="icon" :name="icon" size="18px" />
		<div
			class="title text-subtitle2 col"
			:class="titAlign ? titAlign : 'text-left'"
		>
			{{ label }}
		</div>
		<q-space />
		<q-btn dense flat icon="close" @click="onCancel">
			<q-tooltip>{{ t('buttons.close') }}</q-tooltip>
		</q-btn>
	</q-bar>
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
	color: $title;
	text-align: center;
	margin: 20px 0;
}
.bar {
	background-color: $grey-1;
	.title {
		color: $title;
	}
}
</style>
