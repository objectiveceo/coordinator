export interface BlogPost {
	title: string
}

export interface Blog {
	fetchPosts(): Promise<BlogPost[]>
}
