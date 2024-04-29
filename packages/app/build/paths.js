const path = require('path');
const fs = require('fs');

const appRoot = fs.realpathSync(process.cwd());

const rootResolve = path.resolve.bind(path, appRoot);

module.exports = {
	notificationHtml: rootResolve('src/notification.html')
	// indexHtml: rootResolve('src/ui/index.html'),
};
