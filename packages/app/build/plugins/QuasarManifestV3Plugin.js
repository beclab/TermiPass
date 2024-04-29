const fs = require('fs');
const path = require('path');

/**
 * webpack 脚本
 * @description 复制文件到指定目录
 */
module.exports = class CopyWebpackPlugin {
	/**
	 *
	 * @param { String } options[index].fromPath 文件来源，文件路径
	 * @param { String } options[index].fromName 文件来源，文件名称
	 * @param { String } options[index].toPath 复制文件路径
	 * @param { String } options[index].toName 复制文件名称
	 */
	constructor(options) {
		this.options = options;
	}

	// webpack 规定每个插件的实例，必须有一个 .apply() 方法，webpack 打包前会调用所有插件的方法，插件可以在该方法中进行钩子的注册。
	apply(compiler) {
		compiler.hooks.environment.tap('QuasarManifestV3Plugin', () => {
			try {
				if (!fs.copyFile) {
					console.error('Your nodejs version is too low, please upgrade!');
				} else {
					const updateArray = [
						{
							fromPath: '.quasar/bex/content/',
							fileName: 'content-script.js',
							fetchStr: 'chrome.extension.getURL',
							replaceFromStrs: ['chrome.extension.getURL'],
							replaceToStrs: ['chrome.runtime.getURL']
						},
						{
							fromPath: 'node_modules/@quasar/app-webpack/lib/webpack/bex/',
							fileName: 'plugin.bex-packager.js',
							fetchStr: 'findAndReplaceInSection',
							replaceFromStrs: [
								'findAndReplaceInSection\\(',
								'findAndReplaceInSection'
							],
							replaceToStrs: [
								'//findAndReplaceInSection(',
								'findWalletAndReplaceInSection'
							]
						}
					];

					updateArray.forEach((item) => {
						const files = fs.readdirSync(item.fromPath, {
							withFileTypes: true
						});

						files.forEach((file) => {
							if (file.isFile() && file.name === item.fileName) {
								const filePath = path.resolve(item.fromPath, item.fileName);
								fs.readFile(filePath, 'utf-8', function (err, contents) {
									if (err) {
										return;
									}
									if (contents.indexOf(item.fetchStr) <= 0) {
										return;
									}
									let replaced = contents;
									item.replaceFromStrs.forEach((subItem, index) => {
										replaced = replaced.replace(
											new RegExp(`${item.replaceFromStrs[index]}`, 'g'),
											`${item.replaceToStrs[index]}`
										);
									});

									fs.writeFile(filePath, replaced, 'utf-8', function (err) {
										console.error(err);
									});
								});
							}
						});
					});
				}
			} catch (error) {
				console.error(error);
			} finally {
				// cb()
			}
		});
	}
};
