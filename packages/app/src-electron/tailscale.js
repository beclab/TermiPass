const ffi = require('@tigerconnect/ffi-napi');

const GoProgram = ffi.Library('./tailscale', {
	Run: ['string', ['string']],
	RunWithArgs: ['string', ['string', 'string']],
	WatchIPN: ['string', ['string', 'bool', 'pointer']],
	SetCookie: ['bool', ['string']],
	GetPrefs: ['string', []],
	GetStatus: ['string', []],
	GetNetcheck: ['string', []]
});
// Callback from the native lib back into js
var callback = ffi.Callback('void', ['string'], function (resp) {
	theport.postMessage({ messagetype: 'watchipn-resp', resp: resp });
});

var theport;

process.parentPort.on('message', (event) => {
	const port = event.ports[0];
	theport = port;
	port.on('message', (message) => {
		const messagetype = message.data.messagetype;
		if (messagetype == 'watchipn') {
			const initial = message.data.initial;
			console.info(GoProgram.WatchIPN('placeholder', initial, callback));
		} else if (messagetype == 'ip') {
			console.info(GoProgram.RunWithArgs('placeholder', 'ip'));
		} else if (messagetype == 'up') {
			const args = message.data.args;
			console.info(GoProgram.RunWithArgs('placeholder', args));
		} else if (messagetype == 'logout') {
			console.info(GoProgram.RunWithArgs('placeholder', 'logout'));
		} else if (messagetype == 'setcookie') {
			const args = message.data.args;
			const result = GoProgram.SetCookie(args);
			console.info('set cookie result', result);
		} else if (messagetype == 'prefs') {
			const prefs = GoProgram.GetPrefs();
			port.postMessage({ messagetype: 'prefs-resp', resp: prefs });
		} else if (messagetype == 'status') {
			const status = GoProgram.GetStatus();
			port.postMessage({ messagetype: 'status-resp', resp: status });
		} else if (messagetype == 'netcheck') {
			const netcheck = GoProgram.GetNetcheck();
			port.postMessage({ messagetype: 'netcheck-resp', resp: netcheck });
		} else {
			console.info('unknow messagetype: ', messagetype);
		}
	});

	port.start();
	// port.postMessage('Hello from utility')
});
