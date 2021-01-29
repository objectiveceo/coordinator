import BlogPost from "./BlogPost"

interface Blog {
	fetchPosts(): Promise<BlogPost[]>
	fetchPost(slug: string): Promise<BlogPost | null>
}

export { Blog, BlogPost }
