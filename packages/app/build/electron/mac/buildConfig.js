const path = require('path');
const buildMacPath = path.join(process.cwd(), 'build/mac');
const macConfig = {
	mac: {
		target: ['dmg', 'zip'],
		minimumSystemVersion: '10.15',
		asar: true,
		extraFiles: [
			{
				from: path.join(buildMacPath, 'Library/'),
				to: 'Library/'
			},
			{
				from: path.join(buildMacPath, 'Frameworks/'),
				to: 'Frameworks/'
			},
			{
				from: path.join(buildMacPath, 'Resources/'),
				to: 'Resources/'
			}
		],
		provisioningProfile: 'build/mac/PlanetaMacDev.provisionprofile',
		entitlements: 'build/mac/entitlements.mac.plist',
		entitlementsInherit: 'build/mac/entitlements.mac.inherit.plist',
		hardenedRuntime: true,
		asarUnpack: ['./*.node'],
		signIgnore: ['./Library/*']
	}
};
module.exports = macConfig;
