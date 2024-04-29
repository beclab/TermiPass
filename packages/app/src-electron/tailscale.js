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
	console.log('resp: ', resp);
	theport.postMessage({ messagetype: 'watchipn-resp', resp: resp });
});

var theport;

process.parentPort.on('message', (event) => {
	const port = event.ports[0];
	theport = port;
	port.on('message', (message) => {
		console.log('111', message);
		const messagetype = message.data.messagetype;
		if (messagetype == 'watchipn') {
			//console.log(GoProgram.RunWithArgs("placeholder", "debug watch-ipn"))
			const initial = message.data.initial;
			console.log(GoProgram.WatchIPN('placeholder', initial, callback));
		} else if (messagetype == 'ip') {
			console.log(GoProgram.RunWithArgs('placeholder', 'ip'));
		} else if (messagetype == 'up') {
			const args = message.data.args;
			console.log(GoProgram.RunWithArgs('placeholder', args));
		} else if (messagetype == 'logout') {
			console.log(GoProgram.RunWithArgs('placeholder', 'logout'));
		} else if (messagetype == 'setcookie') {
			const args = message.data.args;
			const result = GoProgram.SetCookie(args);
			console.log('set cookie result', result);
		} else if (messagetype == 'prefs') {
			const prefs = GoProgram.GetPrefs();
			console.log(prefs);
			port.postMessage({ messagetype: 'prefs-resp', resp: prefs });
		} else if (messagetype == 'status') {
			const status = GoProgram.GetStatus();
			console.log('status: ', status);
			port.postMessage({ messagetype: 'status-resp', resp: status });
		} else if (messagetype == 'netcheck') {
			const netcheck = GoProgram.GetNetcheck();
			console.log('status: ', netcheck);
			port.postMessage({ messagetype: 'netcheck-resp', resp: netcheck });
		} else {
			console.log('unknow messagetype: ', messagetype);
		}
	});

	port.start();
	// port.postMessage('Hello from utility')
});

console.log('utility process');
