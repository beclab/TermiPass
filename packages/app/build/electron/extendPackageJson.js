const { execSync } = require('child_process');
const expendPackageJson = (pkg) => {
	let latestTag = '';
	try {
		execSync('git fetch -a');

		const lastCommit = execSync('git rev-list --tags --max-count=1')
			.toString()
			.replace('\n', '');

		latestTag = execSync(`git describe --tags ${lastCommit}`)
			.toString()
			.replace('\n', '');
	} catch (error) {
		console.log('get latestTag error');
		console.log(error);
		return;
	}
	console.log(latestTag);

	const regex = /^v(\d+)\.(\d+)\.(\d+)$/;
	const match = latestTag.match(regex);
	if (!match) {
		return;
	}
	const [, major, minor, patch] = match;
	try {
		pkg.version = `${major}.${minor}.${patch}`;
	} catch (error) {
		console.log(error);
	}
};

module.exports = expendPackageJson;
