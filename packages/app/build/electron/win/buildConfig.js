const path = require('path');
const buildWinPath = path.join(process.cwd(), 'build/win/');

const winConfig = {
	win: {
		target: 'nsis',
		signingHashAlgorithms: ['sha256'],
		signDlls: false,
		extraFiles: [
			{
				from: path.join(buildWinPath, 'root/'),
				to: './'
			},
			{
				from: path.join(buildWinPath, 'files/root/'),
				to: './'
			},
			{
				from: path.join(buildWinPath, 'files/resources/app.asar.unpacked/'),
				to: './resources/app.asar.unpacked/'
			}
		],
		asarUnpack: ['./*.node']
	},
	nsis: {
		perMachine: true,
		include: path.join(buildWinPath, 'installer.nsh')
	}
};
module.exports = winConfig;
