const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

module.exports = class CapacitorUpdateVersionCode {
	apply(compiler) {
		compiler.hooks.environment.tap('CapacitorUpdateVersionCode', () => {
			try {
				const tagsOutput = execSync('git tag').toString();
				console.log('tagsOutput===>');
				console.log(tagsOutput);
				const numberOfTags = tagsOutput.trim().split('\n').length;
				if (numberOfTags < 10) {
					return;
				}
				const capacitorPackageJsonUrl = path.join(
					process.cwd(),
					'src-capacitor/package.json'
				);

				console.log('capacitorPackageJsonUrl ===>', capacitorPackageJsonUrl);
				const capacitorPackageJson = fs.readFileSync(
					capacitorPackageJsonUrl,
					'utf-8'
				);
				const capacitorPackage = JSON.parse(capacitorPackageJson);
				capacitorPackage.versionCode = `${numberOfTags}`;
				console.log('capacitorPackage ===>', capacitorPackage);

				fs.writeFileSync(
					capacitorPackageJsonUrl,
					JSON.stringify(capacitorPackage, null, 2)
				);
			} catch (error) {
				console.log(error);
			}
		});
	}
};
