<template>
	<div class="row itemWrap">
		<div
			class="column col-6"
			:class="!$q.platform.is.mobile ? 'borderRight' : ''"
		>
			<OrgInvitesList />
		</div>

		<div class="col-6">
			<OrgInvitesView />
		</div>
	</div>
</template>

<script lang="ts" setup>
import OrgInvitesView from './OrgInvitesView.vue';
import OrgInvitesList from './OrgInvitesList.vue';
import { useQuasar } from 'quasar';
const $q = useQuasar();
</script>

<style lang="scss" scoped>
.itemWrap {
	height: 100%;
}

.borderRight {
	border-right: 1px solid $grey-12;
}
</style>
