const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

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
	const appPackageJsonUrl = path.join(process.cwd(), 'package.json');
	const appPackageJson = fs.readFileSync(appPackageJsonUrl, 'utf-8');
	const appPackage = JSON.parse(appPackageJson);
	appPackage.version = `${major}.${minor}.${patch}`;
	fs.writeFileSync(appPackageJsonUrl, JSON.stringify(appPackage, null, 2));
	// 执行 git tag 命令，获取所有标签，并将结果转换成字符串
	const tagsOutput = execSync('git tag').toString();

	// 将字符串按换行符分割成数组，并获取数组的长度，即标签数量
	const numberOfTags = tagsOutput.trim().split('\n').length + 10;

	const capacitorPackageJsonUrl = path.join(
		process.cwd(),
		'src-capacitor/package.json'
	);
	const capacitorPackageJson = fs.readFileSync(
		capacitorPackageJsonUrl,
		'utf-8'
	);
	const capacitorPackage = JSON.parse(capacitorPackageJson);
	capacitorPackage.versionCode = `${numberOfTags}`;
	fs.writeFileSync(
		capacitorPackageJsonUrl,
		JSON.stringify(capacitorPackage, null, 2)
	);

	console.log('标签数量:', numberOfTags);
} catch (error) {
	console.log(error);
}

// try {

// } catch (error) {
// 	console.error('获取标签数量时出错:', error.message);
// }
