<template>
	<div class="row itemWrap">
		<div
			class="column col-6"
			:class="!$q.platform.is.mobile ? 'borderRight' : ''"
		>
			<OrgMembersList />
		</div>

		<div class="col-6">
			<OrgMembersView />
		</div>
	</div>
</template>

<script lang="ts" setup>
import OrgMembersView from './OrgMembersView.vue';
import OrgMembersList from './OrgMembersList.vue';
</script>

<style lang="scss" scoped>
.itemWrap {
	width: 100%;
	height: 100%;
}

.borderRight {
	border-right: 1px solid $grey-12;
}
</style>
