const path = require('path');
const fs = require('fs');

console.log('NODE_ENV:', process.env.TAG_VERSION);
const regex = /^v(\d+)\.(\d+)\.(\d+)$/;
const match = process.env.TAG_VERSION.match(regex);
if (!match) {
	console.log('TAG_VERSION 不符合要求');
	return;
}
console.log('TAG_VERSION 符合要求');
const [, major, minor, patch] = match;
console.log('Major:', major);
console.log('Minor:', minor);
console.log('Patch:', patch);

try {
	const appPackageJsonUrl = path.join(process.cwd(), 'src-bex/manifest.json');
	const appPackageJson = fs.readFileSync(appPackageJsonUrl, 'utf-8');
	const appPackage = JSON.parse(appPackageJson);
	appPackage.version = `${major}.${minor}.${patch}`;
	fs.writeFileSync(appPackageJsonUrl, JSON.stringify(appPackage, null, 2));
} catch (error) {
	console.log(error);
}

// try {

// } catch (error) {
// 	console.error('获取标签数量时出错:', error.message);
// }
