const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
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
	const appPackageJsonUrl = path.join(process.cwd(), 'package.json');
	const appPackageJson = fs.readFileSync(appPackageJsonUrl, 'utf-8');
	const appPackage = JSON.parse(appPackageJson);
	appPackage.version = `${major}.${minor}.${patch}`;
	fs.writeFileSync(appPackageJsonUrl, JSON.stringify(appPackage, null, 2));
} catch (error) {
	console.log(error);
}
