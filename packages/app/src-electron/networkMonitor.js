const dns = require('dns');

const options = {
	family: 4,
	servers: ['8.8.8.8', '114.114.114.114']
};

const host = 'www.apple.com';

let timer;

let networkStatus = true;

let curreport;

function startNetworkCheck() {
	if (timer) {
		clearInterval(timer);
		timer = undefined;
	}
	timer = setInterval(() => {
		dns.lookup(host, options, (err) => {
			if (err) {
				console.error(`[network-monitor] error: ${err.message}`);
			}
			emitNetworkStatusDidChange(err ? false : true);
		});
	}, 1000);
}

function endNetworkCheck() {
	if (timer) {
		clearInterval(timer);
		timer = undefined;
	}
}

function emitNetworkStatusDidChange(status) {
	if (networkStatus === status) {
		return;
	}
	networkStatus = status;
	console.log(status);
	if (!curreport) {
		return;
	}

	curreport.postMessage({
		type: 'network_status',
		content: status
	});
}

process.parentPort.on('message', (event) => {
	const port = event.ports[0];
	curreport = port;
	port.on('message', (message) => {
		const type = message.data.type;

		if (type == 'start') {
			startNetworkCheck();
		}
		if (type == 'end') {
			endNetworkCheck();
		}
	});

	port.start();

	port.postMessage({ type: 'ready' });
});
