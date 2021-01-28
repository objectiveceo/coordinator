export interface BlogPost {
	title: string
}

export interface Blog {
	fetchPosts(): BlogPost[]
}
