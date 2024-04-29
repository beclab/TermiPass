<template>
	<nav :class="{ active }">
		<template v-if="store.isLogged">
			<button
				class="action"
				@click="toRoot"
				:aria-label="$t('sidebar.myFiles')"
				:title="$t('sidebar.myFiles')"
			>
				<i class="material-icons">folder</i>
				<span>{{ $t('sidebar.myFiles') }}</span>
			</button>

			<div v-if="store.user.perm.create">
				<button
					@click="store.showHover('newDir')"
					class="action"
					:aria-label="$t('sidebar.newFolder')"
					:title="$t('sidebar.newFolder')"
				>
					<i class="material-icons">create_new_folder</i>
					<span>{{ $t('sidebar.newFolder') }}</span>
				</button>

				<button
					@click="store.showHover('newFile')"
					class="action"
					:aria-label="$t('sidebar.newFile')"
					:title="$t('sidebar.newFile')"
				>
					<i class="material-icons">note_add</i>
					<span>{{ $t('sidebar.newFile') }}</span>
				</button>
			</div>

			<div>
				<button
					v-if="canLogout"
					@click="logout"
					class="action"
					id="logout"
					:aria-label="$t('sidebar.logout')"
					:title="$t('sidebar.logout')"
				>
					<i class="material-icons">exit_to_app</i>
					<span>{{ $t('sidebar.logout') }}</span>
				</button>
			</div>
		</template>
		<template v-else>
			<router-link
				class="action"
				to="/login"
				:aria-label="$t('sidebar.login')"
				:title="$t('sidebar.login')"
			>
				<i class="material-icons">exit_to_app</i>
				<span>{{ $t('sidebar.login') }}</span>
			</router-link>

			<router-link
				v-if="signup"
				class="action"
				to="/login"
				:aria-label="$t('sidebar.signup')"
				:title="$t('sidebar.signup')"
			>
				<i class="material-icons">person_add</i>
				<span>{{ $t('sidebar.signup') }}</span>
			</router-link>
		</template>

		<div
			class="credits"
			v-if="route.path.includes('/files/')"
			style="width: 90%; margin: 2em 2.5em 3em 2.5em"
		>
			<br />
			{{ usage.used }} of {{ usage.total }} used
		</div>

		<p class="credits">
			<span>
				<span v-if="disableExternal">File Browser</span>
				<a
					v-else
					rel="noopener noreferrer"
					target="_blank"
					href="https://github.com/filebrowser/filebrowser"
				></a>
				<span> {{ version }}</span>
			</span>
			<span>
				<a @click="help">{{ $t('sidebar.help') }}</a>
			</span>
		</p>
	</nav>
</template>

<script lang="js">
import { defineComponent, ref, computed, watch } from 'vue';
import { useDataStore } from '../stores/data';
import { useRoute,useRouter } from 'vue-router'

import * as auth from '../utils/auth';
import {
  version,
  signup,
  disableExternal,
  noAuth,
  loginPage,
} from '../utils/constants';
import { files as api } from '../api';
import prettyBytes from 'pretty-bytes';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  name: 'SidebarComponent',
  setup() {
    const store = useDataStore();

    const route = useRoute();
    const router = useRouter();

    const { t } = useI18n()

    const active = computed( function() {
      return store.show === 'sidebar';
    })

    const canLogout = computed(function() {
      return !noAuth && loginPage
    })

    const toRoot = ()=> {
      router.push({ path: '/files/' });
      store.closeHovers();
    }

    const help = ()=> {
      store.showHover('help');
    }

    const logout = ()=> {
      auth.logout
    }

    const usage = ref({used: '0 B', total: '0 B', usedPercentage: 0});
    watch(
    () => route.path,
    async (npath) => {
      if( npath.includes('/files/') ) {
            let path = npath.endsWith('/')
            ? npath
            : npath + '/';
          let usageStats  = { used: 0, total: 0, usedPercentage: 0 };
          try {
            let data = await api.usage(path);
            console.log(data)
            usageStats = {
              used: prettyBytes(data.used, { binary: true }),
              total: prettyBytes(data.total, { binary: true }),
              usedPercentage: Math.round((data.used / data.total) * 100),
            };
          } catch (error) {
						console.log(error);
          }
          usage.value = usageStats;
      }
    },
  );
    return {
      store,
      route,
      disableExternal,
      toRoot,
      signup,
      version,
      canLogout,
      active,
      help,
      logout,
      usage,
      t
    }
  }
})
</script>
