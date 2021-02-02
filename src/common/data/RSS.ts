import { Blog, BlogPost } from '.'
import { Feed, Item } from 'feed'

export type LinkGenerator = (post: BlogPost) => string

export interface BlogInfo {
	title: string
	id: string
	copyright: string
	linkGenerator: LinkGenerator
}

export interface RSSItem {
	content?: string
	date: Date
	link: string
	title: string
}

export interface Options {
	copyright: string
	id: string
	title: string
}

export interface FeedGenerator {
	json1: () => string
	rss2: () => string

	items: RSSItem[]
	options: Options
}

export default async function generate(info: BlogInfo, blog: Blog): Promise<FeedGenerator> {
	const {
		copyright,
		id,
		title,
	} = info

	const feed = new Feed({
		copyright,
		id,
		title,
	})

	const posts = await blog.fetchPosts()
	posts.map(p => map(p, info.linkGenerator)).forEach(i => feed.addItem(i))

	return feed
}

function map(post: BlogPost, linkGenerator: LinkGenerator): Item {
	return {
		content: post.content,
		date: post.creationDate,
		link: linkGenerator(post),
		title: post.title,
	}
}
