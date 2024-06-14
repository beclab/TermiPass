<template>
	<div class="column attach">
		<div class="">
			<div class="text-light-blue-default text-subtitle2">
				{{ attach?.name }}
			</div>
			<div class="text-body3 text-ink-1">
				{{
					(attach.type || t('vault_t.unkown_file_type')) +
					' - ' +
					fileSize(attach?.size)
				}}
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch } from 'vue';
import { AttachmentInfo } from '@didvault/sdk/src/core';
import { fileSize } from '@didvault/sdk/src/util';
import { useI18n } from 'vue-i18n';

export default defineComponent({
	name: 'AttachmentComponent',
	props: {
		itemID: {
			type: String,
			required: true
		},
		attach: {
			type: AttachmentInfo,
			required: true
		},
		editing: {
			type: Boolean,
			required: true
		}
	},
	components: {},
	setup(props, context) {
		const attachVaule = ref(props.attach.name);

		watch(
			() => props.attach,
			(newValue, oldValue) => {
				if (newValue == oldValue) {
					return;
				}
				attachVaule.value = props.attach.name;
			}
		);

		const isEditing = computed(function () {
			return props.editing;
		});

		function onRemove() {
			context.emit('remove');
		}

		const { t } = useI18n();

		return {
			attachVaule,
			isEditing,
			onRemove,
			fileSize,
			t
		};
	}
});
</script>

<style lang="scss" scoped>
.attach {
	padding-left: 5px;
}
</style>
