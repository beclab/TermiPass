const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

module.exports = class CapacitorUpdateVersionCode {
	apply(compiler) {
		compiler.hooks.environment.tap('CapacitorUpdateVersionCode', () => {
			const tagsOutput = execSync('git tag').toString();
			const numberOfTags = tagsOutput.trim().split('\n').length;

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
		});
	}
};
