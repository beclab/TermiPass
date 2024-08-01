<template>
	<div
		v-if="termipassStore.totalStatus?.isError == UserStatusActive.error"
		class="error-content text-body3 row items-center justify-center q-py-sm"
		ref="header_reminder"
	>
		<q-icon name="sym_r_error" size="20px" />
		<div
			class="q-ml-sm"
			style="max-width: calc(100% - 70px)"
			v-if="termipassStore.totalStatus.description"
		>
			<div v-if="termipassStore.totalStatus.descriptionEx">
				{{
					termipassStore.totalStatus.description.split(
						termipassStore.totalStatus.descriptionEx
					)[0]
				}}
				<span class="jump-subline-item" @click="itemClick">{{
					termipassStore.totalStatus.descriptionEx
				}}</span>
				{{
					termipassStore.totalStatus.description.split(
						termipassStore.totalStatus.descriptionEx
					).length > 1
						? termipassStore.totalStatus.description.split(
								termipassStore.totalStatus.descriptionEx
						  )[1]
						: ''
				}}
			</div>
			<div v-else>
				{{ termipassStore.totalStatus.description }}
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { UserStatusActive } from '../../utils/checkTerminusState';
import { getPlatform } from '../../../../sdk/src/core';
import { TerminusCommonPlatform } from '../../platform/terminusCommon/terminalCommonPlatform';
import { useTermipassStore } from '../../stores/termipass';
const termipassStore = useTermipassStore();

const itemClick = () => {
	const platform = getPlatform() as TerminusCommonPlatform;
	platform.userStatusUpdateAction();
};
</script>

<style scoped lang="scss">
.error-content {
	background: $red-alpha;
	width: 100%;
	color: $red;
}
</style>
