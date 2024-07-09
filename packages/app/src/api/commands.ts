import { removePrefix } from './utils';
import { useDataStore } from '../stores/data';

const ssl = window.location.protocol === 'https:';
const protocol = ssl ? 'wss:' : 'ws:';

export default function command(url, command, onmessage, onclose) {
	const store = useDataStore();
	const baseURL = store.baseURL();
	url = removePrefix(url);
	url = `${protocol}//${window.location.host}${baseURL}/api/command${url}?auth=${store.jwt}`;

	const conn = new window.WebSocket(url);
	conn.onopen = () => conn.send(command);
	conn.onmessage = onmessage;
	conn.onclose = onclose;
}
