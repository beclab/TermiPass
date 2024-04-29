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

	permissionService.getWithoutUpdate(origin);
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
