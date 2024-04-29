import PromiseFlow from '../utils/promiseFlow';
import {
	notificationService,
	permissionService,
	sessionService
} from '../service';
import { getExtensionBackgroundPlatform } from '../../background/extensionBackgroundPlatform';
import providerController from './providerController';

const connectOrigins = new Set<string>();
const lockedOrigins = new Set<string>();
const flow = new PromiseFlow();

const flowContext = flow
	.use(async (ctx: any, next: any) => {
		const {
			request: {
				session: { origin, name, icon }
			}
		} = ctx;
		//check unlock
		const center = getExtensionBackgroundPlatform().dataCenter;
		const hasUser = await center.hasUser();
		if (!hasUser) {
			throw Error('Please import the account first.');
		}
		const isLocked = center.isLocked();
		if (isLocked) {
			if (lockedOrigins.has(origin)) {
				throw Error('Already processing unlock. Please wait.');
			}
			ctx.request.requestedApproval = true;
			lockedOrigins.add(origin);
			try {
				await notificationService.requestApproval({
					session: { origin, name, icon },
					routerPath: '/unlock'
				});
				sessionService.broadcastEvent('setUnlock', true);
				lockedOrigins.delete(origin);
			} catch (e) {
				lockedOrigins.delete(origin);
				throw e;
			}
		}
		return next();
	})
	.use(async (ctx: any, next: any) => {
		const {
			request: {
				session: { origin, name, icon }
			}
		} = ctx;
		//check permission
		if (!permissionService.hasPermission(origin)) {
			if (connectOrigins.has(origin)) {
				throw Error('Already processing connect. Please wait.');
			}
			ctx.request.requestedApproval = true;
			connectOrigins.add(origin);
			try {
				const { didKey } = await notificationService.requestApproval({
					session: { origin, name, icon },
					routerPath: '/connect'
				});
				connectOrigins.delete(origin);
				if (didKey) {
					permissionService.addConnectedSite(origin, name, icon);
					sessionService.broadcastEvent('connect', didKey);
				}
			} catch (e) {
				connectOrigins.delete(origin);
				throw e;
			}
		}
		return next();
	})
	.use(async (ctx: any, next: any) => {
		const {
			request: {
				session,
				data: { method, params }
			}
		} = ctx;
		//check request didKey
		if (!Reflect.getMetadata('SAFE', providerController, method)) {
			const center = getExtensionBackgroundPlatform().dataCenter;
			const { didKey: requestDidKey } = params;
			const include = await center.includeDidKey(requestDidKey);
			if (!include) {
				throw new Error(`didKey ${requestDidKey} does not exist in user list`);
			}
			const curDidKey = await center.getCurrentDidKey();
			if (curDidKey !== requestDidKey) {
				ctx.request.requestedApproval = true;
				try {
					const { selectedDidKey } = await notificationService.requestApproval({
						session,
						routerPath: '/accounts',
						params: { requestDidKey }
					});
					if (selectedDidKey !== requestDidKey) {
						throw Error('selected didKey error');
					}
					sessionService.broadcastEvent('accountChanged', selectedDidKey);
				} catch (e) {
					return e;
				}
			}
		}
		return next();
	})
	.use(async (ctx: any, next: any) => {
		const {
			request: {
				data: { params, method },
				session
			}
		} = ctx;
		const [approvalType, condition] =
			Reflect.getMetadata('APPROVAL', providerController, method) || [];
		if (approvalType && condition) {
			ctx.request.requestedApproval = true;
			try {
				//approval auth
				const data = await notificationService.requestApproval({
					session,
					routerPath: '/authorization',
					params,
					approvalType
				});

				//business page
				if (data && data.routerPath) {
					ctx.result = await notificationService.requestApproval({
						session,
						routerPath: data.routerPath,
						params,
						approvalType
					});
				}
			} catch (e) {
				console.error('errrr ===>', e);
				return e;
			}
		}
		return next();
	})
	.use(async (ctx: any) => {
		const { request, result } = ctx;
		const {
			request: {
				data: { method }
			}
		} = ctx;
		return Promise.resolve<any>(
			(providerController as any)[method]({ ...request, ...result })
		);
	})
	.callback();

export default async (request: any) => {
	const ctx: any = { request: { ...request, requestedApproval: false } };
	return flowContext(ctx).finally(() => {
		if (ctx.request.requestedApproval) {
			flow.requestedApproval = false;
			notificationService.unLock();
		}
	});
};
