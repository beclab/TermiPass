const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

module.exports = class UpdatePackageVersionByLatestTag {
	constructor(paths) {
		this.paths = paths;
	}
	apply(compiler) {
		compiler.hooks.environment.tap(
			'UpdatePackageVersionByLatestTagPlugin',
			() => {
				console.log('this.paths ===>');
				console.log(this.paths);
				const latestTag = execSync(`git describe --tags --abbrev=0`)
					.toString()
					.replace('\n', '');
				console.log(latestTag);

				const regex = /^v(\d+)\.(\d+)\.(\d+)$/;
				const match = latestTag.match(regex);
				if (!match) {
					return;
				}
				const [, major, minor, patch] = match;

				try {
					const appPackageJsonUrl = path.join(
						process.cwd(),
						this.paths && this.paths.length > 0 ? this.paths[0] : 'package.json'
					);
					const appPackageJson = fs.readFileSync(appPackageJsonUrl, 'utf-8');
					const appPackage = JSON.parse(appPackageJson);
					appPackage.version = `${major}.${minor}.${patch}`;
					fs.writeFileSync(
						appPackageJsonUrl,
						JSON.stringify(appPackage, null, 2)
					);
				} catch (error) {
					console.log(error);
				}
			}
		);
	}
};
