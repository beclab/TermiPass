/**
 * bex平台存储一些简单数据
 */
export interface SimpleStorage {
	saveSimple(key: string, value: any): Promise<void>;

	removeSimple(key: string): Promise<void>;

	getSimple<T>(key: string, dValue: T): Promise<T>;
}
