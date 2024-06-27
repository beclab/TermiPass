export enum ExtensionBadgeLevel {
	low = 1,
	middle = 2,
	high = 3
}

export interface UpdateBadgeInterface {
	priority: { level: ExtensionBadgeLevel; num: number };

	badgeUpdatable(): Promise<boolean>;

	updateBadge(): Promise<void>;
}
