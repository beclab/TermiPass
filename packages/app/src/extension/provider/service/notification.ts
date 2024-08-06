import Events from 'events';
import { browser, Windows } from 'webextension-polyfill-ts';

const BROWSER_HEADER = 80;
const WINDOW_SIZE = {
	width: 450, // idk why windows cut the width.
	height: 700
};

export interface Approval {
	id: number;
	taskId: number | null;
	data: {
		params?: any;
		origin?: string;
		requestDefer?: Promise<any>;
		approvalType?: string;
		routerPath?: string;
		session: any;
	};
	winProps: any;
	resolve?(params?: any): void;
	reject?(err: Error): void;
}

// something need user approval in window
// should only open one window, unfocus will close the current notification
class NotificationService extends Events {
	currentApproval: Approval | null = null;
	_approvals: Approval[] = [];
	notificationWindowId = 0;
	isLocked = false;

	get approvals() {
		return this._approvals;
	}

	set approvals(val: Approval[]) {
		this._approvals = val;
	}

	constructor() {
		super();
		browser.windows.onRemoved.addListener((winId) => {
			if (winId === this.notificationWindowId) {
				this.notificationWindowId = 0;
				this.rejectAllApprovals();
			}
		});
	}

	hasPendingApproval = () => {
		return this.approvals.length > 0;
	};

	activeFirstApproval = () => {
		if (this.notificationWindowId) {
			this.windowUpdate(this.notificationWindowId, true);
			return;
		}
		if (this.approvals.length < 0) return;
		const approval = this.approvals[0];
		this.currentApproval = approval;
		this.openNotification(approval.winProps);
	};

	deleteApproval = (approval: any) => {
		if (approval && this.approvals.length > 1) {
			this.approvals = this.approvals.filter((item) => approval.id !== item.id);
		} else {
			this.currentApproval = null;
			this.approvals = [];
		}
	};

	getApproval = async () => {
		return this.currentApproval;
	};

	resolveApproval = async (data?: any, forceReject = false) => {
		if (forceReject) {
			this.currentApproval?.reject &&
				this.currentApproval?.reject(new Error('User Cancel'));
		} else {
			this.currentApproval?.resolve && this.currentApproval?.resolve(data);
		}

		const approval = this.currentApproval;

		this.deleteApproval(approval);

		if (this.approvals.length > 0) {
			this.currentApproval = this.approvals[0];
		} else {
			this.currentApproval = null;
		}

		this.emit('resolve', data);
	};

	rejectApproval = async (err?: string, isInternal = false) => {
		console.log(1);

		if (isInternal) {
			console.log(2);
			this.currentApproval?.reject &&
				this.currentApproval?.reject(new Error('internal error'));
		} else {
			console.log(3);
			this.currentApproval?.reject &&
				this.currentApproval?.reject(new Error('user Rejected Request'));
		}
		console.log(4);
		const approval = this.currentApproval;
		console.log(5);
		if (approval && this.approvals.length > 1) {
			console.log(6);
			this.deleteApproval(approval);
			this.currentApproval = this.approvals[0];
		} else {
			console.log(7);
			await this.clear();
		}
		console.log(8);
		console.log(this.approvals.length);

		this.emit('reject', err);
	};

	requestApproval = async (data: any, winProps?: any): Promise<any> => {
		return new Promise((resolve, reject) => {
			const uuid = Date.now();
			const approval: Approval = {
				taskId: uuid,
				id: uuid,
				data,
				winProps,
				resolve,
				reject
			};

			if (this.currentApproval) {
				throw Error('please request after current approval resolve');
			}

			if (data.isUnshift) {
				this.approvals = [approval, ...this.approvals];
				this.currentApproval = approval;
			} else {
				this.approvals = [...this.approvals, approval];
				if (!this.currentApproval) {
					this.currentApproval = approval;
				}
			}
			if (this.notificationWindowId) {
				this.windowUpdate(this.notificationWindowId, true);
			} else {
				this.openNotification(approval.winProps);
			}
		});
	};

	clear = async () => {
		this.approvals = [];
		this.currentApproval = null;
		if (this.notificationWindowId) {
			this.windowRemove(this.notificationWindowId);
			this.notificationWindowId = 0;
		}
	};

	rejectAllApprovals = () => {
		this.approvals.forEach((approval) => {
			approval.reject &&
				approval.reject(new Error('User rejected the request.'));
		});
		this.approvals = [];
		this.currentApproval = null;
	};

	unLock = () => {
		this.isLocked = false;
	};

	lock = () => {
		this.isLocked = true;
	};

	openNotification = (winProps: any) => {
		if (this.isLocked) {
			throw Error('has other approval is running');
		}
		this.lock();
		if (this.notificationWindowId) {
			this.windowRemove(this.notificationWindowId);
			this.notificationWindowId = 0;
		}

		this.windowOpenNotification(winProps).then((winId) => {
			this.notificationWindowId = winId || 0;
		});
	};

	windowRemove = async (winId: any) => {
		return browser.windows.remove(winId);
	};

	windowOpenNotification = ({ route = '', ...rest } = {}): Promise<
		number | undefined
	> => {
		const url = `www/notification.html?notification=true&webos_app_plugin_id=${
			chrome.runtime.id
		}${route && `#${route}`}`;

		return this.create({ url, ...rest });
	};

	windowUpdate(windowId: number, focused: boolean): Promise<any> {
		return browser.windows.update(windowId, {
			focused: focused
		});
	}

	create = async ({ url, ...rest }: any): Promise<number | undefined> => {
		const {
			top: cTop,
			left: cLeft,
			width
		} = await browser.windows.getCurrent({
			windowTypes: ['normal']
		} as Windows.GetInfo);

		const top = (cTop || 0) + BROWSER_HEADER;
		const left = (cLeft || 0) + (width || 0) - WINDOW_SIZE.width;

		const currentWindow = await browser.windows.getCurrent();
		let win: any;
		if (currentWindow.state === 'fullscreen') {
			win = await this.createFullScreenWindow({ url, ...rest });
		} else {
			win = await browser.windows.create({
				focused: true,
				url,
				type: 'popup',
				top,
				left,
				...WINDOW_SIZE,
				...rest
			});
		}
		if (win.left !== left && currentWindow.state !== 'fullscreen') {
			await browser.windows.update(win.id, { left, top });
		}
		return win.id;
	};

	createFullScreenWindow = async ({ url, ...rest }: any) => {
		return new Promise((resolve) => {
			chrome.windows.create(
				{
					focused: true,
					url,
					type: 'popup',
					...rest,
					width: undefined,
					height: undefined,
					left: undefined,
					top: undefined,
					state: 'fullscreen'
				},
				(win: any) => {
					resolve(win);
				}
			);
		});
	};
}

export default new NotificationService();
