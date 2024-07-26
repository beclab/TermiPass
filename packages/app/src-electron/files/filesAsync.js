const { parentPort } = require('worker_threads');
const path = require('path');
const os = require('os');

const { FileAddon } = require(path.resolve(__dirname, 'DesktopAddon.node'));

function JSFnRef() {}
const filesAddon = new FileAddon(JSFnRef);

const repoWorktreesMap = {};

parentPort.on('message', async (message) => {
	const type = message.type;
	const params = message.params;
	const resolveKey = message.resolveKey;
	const callbackMessage = {
		resolveKey
	};

	if (type == 'loginAccount') {
		const result = filesAddon.loginAccount(
			params.url,
			params.username,
			'abcd123456',
			os.hostname(),
			params.authToken
		);

		parentPort.postMessage({
			...callbackMessage,
			result
		});
		return;
	}

	if (type == 'isAutoSyncEnable') {
		const result = filesAddon.isAutoSyncEnable();
		parentPort.postMessage({
			...callbackMessage,
			result
		});
		return;
	}

	if (type == 'setAutoSyncEnable') {
		const authSync = params['authSync'];
		const result = filesAddon.setAutoSyncEnable(authSync);
		parentPort.postMessage({
			...callbackMessage,
			result
		});
		return;
	}
	if (type == 'hasLocalRepo') {
		const repo_id = params['repo_id'];
		const result = filesAddon.hasLocalRepo(repo_id);
		parentPort.postMessage({
			...callbackMessage,
			result
		});
		return;
	}

	if (type == 'openLocalRepo') {
		const repo_id = params['repo_id'];
		const hasLocalRepo = filesAddon.hasLocalRepo(repo_id);
		let workTree = repoWorktreesMap[repo_id];
		if (hasLocalRepo) {
			const nWorkTree = filesAddon.getLocalRepoWorkTree(repo_id);
			if (nWorkTree && nWorkTree.length) {
				workTree = nWorkTree;
			}
		}
		parentPort.postMessage({
			...callbackMessage,
			result: workTree
		});
		return;
	}

	if (type == 'repoAddSync') {
		const hasLocalRepo = filesAddon.hasLocalRepo(params.repo_id);
		let result = false;
		if (!hasLocalRepo) {
			repoWorktreesMap[params.repo_id] = params.worktree;
			const addRepoResult = filesAddon.repoAddSync(
				params.worktree,
				params.repo_id,
				params.name,
				params.password,
				params.readonly
			);
			result = addRepoResult && addRepoResult.length > 0;
		}

		parentPort.postMessage({
			...callbackMessage,
			result
		});

		return;
	}

	if (type == 'repoRemoveSync') {
		const hasLocalRepo = filesAddon.hasLocalRepo(params.repo_id);
		let result = false;
		if (hasLocalRepo) {
			result = filesAddon.repoRemoveSync(params.repo_id);
		}

		parentPort.postMessage({
			...callbackMessage,
			result
		});

		return;
	}

	if (type == 'syncRepoImmediately') {
		const hasLocalRepo = filesAddon.hasLocalRepo(params.repo_id);
		let result = false;
		if (hasLocalRepo) {
			filesAddon.syncRepoImmediately(params.repo_id);
			result = true;
		}

		parentPort.postMessage({
			...callbackMessage,
			result
		});

		return;
	}

	if (type == 'repoSyncInfo') {
		const hasLocalRepo = filesAddon.hasLocalRepo(params.repo_id);
		let result = 'repo not in sync';
		if (hasLocalRepo) {
			result = filesAddon.repoSyncInfo(params.repo_id);
		}
		parentPort.postMessage({
			...callbackMessage,
			result
		});
		return;
	}

	if (type == 'defaultSyncSavePath') {
		const result = filesAddon.defaultSyncPath();
		parentPort.postMessage({
			...callbackMessage,
			result
		});
		return;
	}

	if (type == 'removeCurrentAccount') {
		const result = filesAddon.removeCurrentAccount(params.url, params.username);
		parentPort.postMessage({
			...callbackMessage,
			result
		});
		return;
	}

	if (type == 'init') {
		filesAddon.config();
	}
});
