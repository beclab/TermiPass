const path = require('path');
const fs = require('fs');

console.log('NODE_ENV:', process.env.TAG_VERSION);
const regex = /^v(\d+)\.(\d+)\.(\d+)$/;
const match = process.env.TAG_VERSION.match(regex);
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
