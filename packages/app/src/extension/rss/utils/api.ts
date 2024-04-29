import { FeedCreationRequest, Feed, CreateEntry } from '../model/type';
import { useRssStore } from '../../../stores/rss';

export async function create_feed(req: FeedCreationRequest) {
	const rssStore = useRssStore();
	try {
		if (!rssStore.instance) {
			rssStore.initInstance();
			if (!rssStore.instance) {
				return undefined;
			}
		}
		const data = await rssStore.instance.post('/knowledge/feed', req);
		return data.data as Feed;
	} catch (e) {
		return undefined;
	}
}

export const save_entry = async (req: CreateEntry[]) => {
	const rssStore = useRssStore();
	try {
		if (!rssStore.instance) {
			rssStore.initInstance();
			if (!rssStore.instance) {
				return undefined;
			}
		}
		const data = await rssStore.instance.post('/knowledge/entry', req);
		return data.data;
	} catch (e) {
		return undefined;
	}
};
