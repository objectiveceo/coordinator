import { Blog, BlogPost } from './index'
import InMemoryBlogPost from './InMemoryBlogPost'

export default class InMemoryBlog implements Blog {
	fetchPosts(): Promise<BlogPost[]> {
		return Promise.resolve([
			new InMemoryBlogPost(),
		])
	}
}
