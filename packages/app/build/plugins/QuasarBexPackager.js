const path = require('path');
const fse = require('fs-extra');
const archiver = require('archiver');

class BexNewPackager {
	constructor(options) {
		this.options = options;
		this.chromeDir = path.join(options.dest, 'chrome');
		this.firefoxDir = path.join(options.dest, 'firefox');
	}

	apply(compiler) {
		compiler.hooks.done.tap('done-compiling', (stats) => {
			if (stats.hasErrors() === false) {
				this.setupDirectories();
				this.fixManifest();
				this.bundleChrome();
				this.bundleFirefox();
			}
		});
	}

	/**
	 * This will fix some of the paths in the manifest file which are different in the build version vs dev version.
	 */
	fixManifest() {
		const manifestFilePath = path.join(this.options.src, 'manifest.json');
		if (fse.existsSync(manifestFilePath) === true) {
			const manifestFileData = fse.readFileSync(manifestFilePath);
			let manifestData = JSON.parse(manifestFileData.toString());
			const newValue = JSON.stringify(manifestData);
			fse.writeFileSync(manifestFilePath, newValue, 'utf-8');
		}
	}

	setupDirectories() {
		fse.ensureDirSync(this.chromeDir);
		fse.ensureDirSync(this.firefoxDir);
	}

	bundleChrome() {
		this.outputToZip(this.options.src, this.chromeDir, this.options.name);
	}

	bundleFirefox() {
		this.outputToZip(this.options.src, this.firefoxDir, this.options.name);
	}

	outputToZip(src, dest, fileName) {
		let output = fse.createWriteStream(path.join(dest, fileName + '.zip'));
		let archive = archiver('zip', {
			zlib: { level: 9 } // Sets the compression level.
		});

		archive.pipe(output);
		archive.directory(src, false);
		archive.finalize();
	}
}

module.exports = BexNewPackager;
