import { DriveType } from './../../stores/files';

export interface DriveMenuType {
	label: string;
	key: string | number;
	icon: string;
	driveType: DriveType;
}
