// const { notarize } = require('@electron/notarize');
const afterSign = async (context) => {
	// const { electronPlatformName, appOutDir } = context;
	// if (electronPlatformName !== 'darwin') {
	// 	return;
	// }
	// const macosConfig = require('../mac/notarize');
	// console.log('macos notarize');
	// const appName = context.packager.appInfo.productFilename;
	// return await notarize({
	// 	appBundleId: 'com.terminus.planetam',
	// 	appPath: `${appOutDir}/${appName}.app`,
	// 	appleId: macosConfig.appleId,
	// 	appleIdPassword: macosConfig.appleIdPassword,
	// 	tool: 'notarytool',
	// 	teamId: macosConfig.teamId
	// });
};
module.exports = afterSign;
