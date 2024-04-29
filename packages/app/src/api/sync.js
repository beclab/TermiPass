import { fetchURL } from './utils';
import { useMenuStore } from '../stores/files-menu';
import { MenuItem } from '../utils/contact';

export async function getSyncMenu() {
	const menuStore = useMenuStore();
	const menu = JSON.parse(JSON.stringify(menuStore.getMenu()));
	const [res2, res3] = await seahubGetRepos(MenuItem.SHAREDWITH);
	const shareChildren = [];
	for (let i = 0; i < res2.data.length; i++) {
		const el = res2.data[i];
		const hsaShareRepo = shareChildren.find((item) => item.id === el.repo_id);
		if (hsaShareRepo) {
			continue;
		}

		shareChildren.push({
			label: el.repo_name,
			key: el.repo_id,
			icon: 'sym_r_folder_shared',
			id: el.repo_id,
			defaultHide: true,
			...el
		});
	}

	const sharedme = [];
	for (let i = 0; i < res3.data.repos.length; i++) {
		const el = res3.data.repos[i];
		sharedme.push({
			label: el.repo_name,
			key: el.repo_id,
			name: el.repo_name,
			icon: 'sym_r_folder_shared',
			id: el.repo_id,
			defaultHide: true,
			...el
		});
	}

	const res1 = await seahubGetRepos(MenuItem.MYLIBRARIES);
	const mineChildren = [];
	for (let i = 0; i < res1.data.repos.length; i++) {
		const el = res1.data.repos[i];

		const hasShareWith = shareChildren.find(
			(item) => item.repo_id === el.repo_id
		);
		const hasShareMe = sharedme.find((item) => item.repo_id === el.repo_id);
		const hasShare = hasShareWith || hasShareMe;

		mineChildren.push({
			label: el.repo_name,
			key: el.repo_id,
			icon: 'sym_r_stop_screen_share',
			id: el.repo_id,
			name: el.repo_name,
			shard_user_hide_flag: hasShare ? false : true,
			share_type: hasShare ? hasShare.share_type : undefined,
			user_email: hasShare ? hasShare.user_email : undefined,
			defaultHide: true,
			...el
		});
	}

	const myLibraries = {
		label: MenuItem.MYLIBRARIES,
		key: 'MyLibraries',
		icon: '',
		expationFlag: true,
		muted: true,
		disableClickable: true
	};
	const shardWith = {
		label: MenuItem.SHAREDWITH,
		key: 'SharedLibraries',
		icon: '',
		expationFlag: false,
		muted: true,
		disableClickable: true
	};

	for (let index = 0; index < menu.length; index++) {
		const el = menu[index];
		if (el.label === MenuItem.SYNC) {
			console.log('syncChildremsyncChildrem', el);
			let shardArr = [];
			if (shareChildren.length > 0 || sharedme.length > 0) {
				shardArr = [shardWith, ...shareChildren, ...sharedme];
			}
			el.children = [myLibraries, ...mineChildren, ...shardArr];
		}
	}

	menuStore.menu = menu;

	const syncIds = mineChildren
		.map((e) => e.id)
		.concat(shareChildren.map((e) => e.id));

	menuStore.addSyncUpdateRepos(syncIds);
}

export const seahubGetRepos = async (menu) => {
	if (menu != MenuItem.SHAREDWITH && menu != MenuItem.MYLIBRARIES) {
		return undefined;
	}

	if (menu == MenuItem.MYLIBRARIES) {
		const res = await fetchURL('/seahub/api/v2.1/repos/?type=mine', {});
		return res;
	} else {
		const res2 = await fetchURL('/seahub/api/v2.1/shared-repos/', {});
		const res3 = await fetchURL('/seahub/api/v2.1/repos/?type=shared', {});
		return [res2, res3];
	}
};

export async function getShareInfo(repo_id) {
	const res = await fetchURL(
		`/seahub/api/v2.1/repos/${repo_id}/share-info/`,
		{}
	);
	return res.data;
}
