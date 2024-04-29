export interface Icon {
	id: number;
	hash: string;
	mime_type: string;
	content: string;
}

export interface Board {
	id: number;
	user_id: number;
	title: string;
	description: string;
}

export interface BoardRequest {
	title: string;
	description: string;
}

export interface FeedIcon {
	feed_id: number;
	icon_id: number;
}

export interface Category {
	id: number;
	title: string;
	user_id: number;
	hide_globally: boolean;
}

export interface CategoryRequest {
	title: string;
	hide_globally?: boolean;
}

export interface Enclosure {
	id: number;
	user_id: number;
	entry_id: number;
	url: string;
	mime_type: string;
	size: number;
}

export interface Entry {
	id: number;
	user_id: number;
	feed_id: number;
	status: string;
	hash: string;
	title: string;
	url: string;
	comments_url: string;
	published_at: string;
	created_at: string;
	changed_at: string;
	readlater_tag: boolean;
	content: string;
	author: string;
	share_code: string;
	starred: boolean;
	reading_time: number;
	enclosures: Enclosure[];
	feed: Feed;
	board_ids: string;
}

export interface EntryContent {
	content: string;
}

export enum EntryStatus {
	Unread = 'unread',
	Read = 'read',
	Removed = 'removed'
}

export interface Feed {
	_id: string;
	sources: string[];
	feed_url: string;
	site_url: string;
	title: string;
	description: string;
	checked_at: string;
	next_check_at: string;
	etag_header: string;
	last_modified_header: string;
	parsing_error_message: string;
	parsing_error_count: number;
	scraper_rules: string;
	rewrite_rules: string;
	crawler: boolean;
	blocklist_rules: string;
	keeplist_rules: string;
	urlrewrite_rules: string;
	user_agent: string;
	cookie: string;
	username: string;
	password: string;
	disabled: boolean;
	ignore_http_cache: boolean;
	allow_self_signed_certificates: boolean;
	fetch_via_proxy: boolean;
	icon_content: string;
	icon_type: string;
	hide_globally: boolean;
	unread_count: number;
	read_count: number;
	//createAt: string;

	updatedAt: string;

	//local
	isTrend: boolean;
}

export interface FeedCounters {
	reads: Record<string, number>;
	unreads: Record<string, number>;
}

export interface FeedCreationRequest {
	feed_url: string;
	source: string;
	user_agent?: string;
	cookie?: string;
	username?: string;
	password?: string;
	crawler?: boolean;
	disabled?: boolean;
	ignore_http_cache?: boolean;
	allow_self_signed_certificates?: boolean;
	fetch_via_proxy?: boolean;
	scraper_rules?: string;
	rewrite_rules?: string;
	blocklist_rules?: string;
	keeplist_rules?: string;
	hide_globally?: boolean;
	urlrewrite_rules?: string;
}

export enum EnteryQueryOrder {
	ID = 'id',
	Status = 'status',
	ChangeAt = 'change_at',
	PublishedAt = 'published_at',
	CategoryTitle = 'category_title',
	CategoryID = 'category_id',
	Title = 'title',
	Author = 'author'
}

export enum EntryQueryDirection {
	ASC = 'asc',
	DESC = 'desc'
}

export interface PageToBoard {
	url: string;
	title: string;
	board_id: number;
}

export interface CreateEntry {
	id?: string;
	url?: string;
	source?: string;
}
