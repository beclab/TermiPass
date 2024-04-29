import { permissionService } from '../service';
import { getExtensionBackgroundPlatform } from '../../background/extensionBackgroundPlatform';

const tabCheckin = ({
	data: {
		params: { name, icon, origin }
	},
	session
}) => {
	session.setProp({ origin, name, icon });
};

const getProviderState = async (req) => {
	const {
		session: { origin }
	} = req;

	const data = permissionService.getWithoutUpdate(origin);
	console.log(data);
	const center = getExtensionBackgroundPlatform().dataCenter;
	const isUnlocked = !center.isLocked();
	const didKey = await center.getUser();
	return {
		isUnlocked,
		didKey
	};
};

export default {
	tabCheckin,
	getProviderState
};
