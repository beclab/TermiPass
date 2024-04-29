import {
	BiometricOptions,
	BiometryType
} from '@capgo/capacitor-native-biometric';
import { i18n } from '../boot/i18n';

const BIOMETRIC_TYPE_OPTION_RECORD: Record<BiometryType, BiometricOptions> = {
	[BiometryType.NONE]: {
		reason: i18n.global.t('for_easy_login'),
		title: i18n.global.t('login')
	},
	[BiometryType.FACE_ID]: {
		reason: i18n.global.t('face_id_verification')
	},
	[BiometryType.TOUCH_ID]: {
		reason: i18n.global.t('touch_id_verification')
	},
	[BiometryType.FINGERPRINT]: {
		title: i18n.global.t('fingerprint_verification'),
		subtitle: i18n.global.t('scan_your_fingerprint_to_verify_your_identity'),
		maxAttempts: 2
	},
	[BiometryType.FACE_AUTHENTICATION]: {
		title: i18n.global.t('face_authentication'),
		subtitle: i18n.global.t('scan_your_face_to_verify_your_identity'),
		maxAttempts: 2
	},
	[BiometryType.IRIS_AUTHENTICATION]: {
		title: i18n.global.t('iris_authentication'),
		subtitle: i18n.global.t('scan_your_iris_to_verify_your_identity'),
		maxAttempts: 2
	},
	[BiometryType.MULTIPLE]: {
		title: i18n.global.t('authentication'),
		subtitle: i18n.global.t('scan_your_authentication_to_verify_your_identity'),
		maxAttempts: 2
	}
};

export const BiometricTypeInfo: Record<
	BiometryType,
	{
		title: string;
		desc: string;
		imagePath: string;
		configTitle: string;
		options: BiometricOptions;
	}
> = {
	[BiometryType.NONE]: {
		title: i18n.global.t('set_up'),
		desc: i18n.global.t('scan_to_verify_your_identity'),
		imagePath: 'login/biometric_setup_touchid.svg',
		configTitle: i18n.global.t('scan_my'),
		options: BIOMETRIC_TYPE_OPTION_RECORD[BiometryType.NONE]
	},
	[BiometryType.FACE_ID]: {
		title: i18n.global.t('set_up_face_id'),
		desc: i18n.global.t('scan_your_face_to_verify_your_identity'),
		imagePath: 'login/biometric_setup_faceid.svg',
		configTitle: i18n.global.t('scan_my_face'),
		options: BIOMETRIC_TYPE_OPTION_RECORD[BiometryType.FACE_ID]
	},
	[BiometryType.TOUCH_ID]: {
		title: i18n.global.t('set_up_touch_id'),
		desc: i18n.global.t('scan_your_fingerprint_to_verify_your_identity'),
		imagePath: 'login/biometric_setup_touchid.svg',
		configTitle: i18n.global.t('scan_my_fingerprint'),
		options: BIOMETRIC_TYPE_OPTION_RECORD[BiometryType.TOUCH_ID]
	},
	[BiometryType.FINGERPRINT]: {
		title: i18n.global.t('set_up_fingerprint'),
		desc: i18n.global.t('scan_your_fingerprint_to_verify_your_identity'),
		imagePath: 'login/biometric_setup_touchid.svg',
		configTitle: i18n.global.t('scan_my_fingerprint'),
		options: BIOMETRIC_TYPE_OPTION_RECORD[BiometryType.FINGERPRINT]
	},
	[BiometryType.FACE_AUTHENTICATION]: {
		title: i18n.global.t('set_up_face_authentication'),
		desc: i18n.global.t('scan_your_face_to_verify_your_identity'),
		imagePath: 'login/biometric_setup_faceid.svg',
		configTitle: i18n.global.t('scan_my_face'),
		options: BIOMETRIC_TYPE_OPTION_RECORD[BiometryType.FACE_AUTHENTICATION]
	},
	[BiometryType.IRIS_AUTHENTICATION]: {
		title: i18n.global.t('set_up_iris_authentication'),
		desc: i18n.global.t('scan_your_iris_to_verify_your_identity'),
		imagePath: 'login/biometric_setup_touchid.svg',
		configTitle: i18n.global.t('scan_my_iris'),
		options: BIOMETRIC_TYPE_OPTION_RECORD[BiometryType.IRIS_AUTHENTICATION]
	},
	[BiometryType.MULTIPLE]: {
		title: i18n.global.t('set_up_authentication'),
		desc: i18n.global.t('scan_your_authentication_to_verify_your_identity'),
		imagePath: 'login/biometric_setup_touchid.svg',
		configTitle: i18n.global.t('scan_my_authentication'),
		options: BIOMETRIC_TYPE_OPTION_RECORD[BiometryType.MULTIPLE]
	}
};
