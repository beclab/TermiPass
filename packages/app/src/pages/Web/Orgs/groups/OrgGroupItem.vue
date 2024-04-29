<template>
	<div class="row items-center justify-start">
		<div class="column">
			<div>{{ group.name }}</div>
			<div class="row">
				<div>Users:</div>
				<div>{{ group.members.length }}</div>
				<div>Vaults:</div>
				<div>{{ group.vaults.length }}</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Group } from '@didvault/sdk/src/core';
//import { formatDateFromNow } from '@didvault/sdk/src/util';

export default defineComponent({
	name: 'OrgGroupItem',
	props: {
		// ...your custom props
		group: {
			type: Group,
			required: true
		}
	},
	components: {},

	emits: [],
	setup() {
		return {};
	}
});
</script>

<style lang="scss" scoped></style>
