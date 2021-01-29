import BlogPost from "./BlogPost"

interface Blog {
	fetchPosts(): Promise<BlogPost[]>
}

export { Blog, BlogPost }
