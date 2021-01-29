import { Blog } from './index'
import BlogPost from "./BlogPost"

export default class InMemoryBlog implements Blog {
	fetchPosts(): Promise<BlogPost[]> {
		return Promise.resolve([
			new BlogPost("something is coming"),
		])
	}
}
