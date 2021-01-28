import { Blog, BlogPost } from './index'
import InMemoryBlogPost from './InMemoryBlogPost'

export default class InMemoryBlog implements Blog {
	fetchPosts(): BlogPost[] {
		return [
			new InMemoryBlogPost(),
		]
	}
}
