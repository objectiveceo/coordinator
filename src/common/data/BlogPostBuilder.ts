import { HasTitle, HasSlug, HasContent } from "./BlogPost";

export class BlogPostBuilder<T> {
	data: { [key: string]: any; } & T;

	constructor(data: T) {
		this.data = data;
	}

	setTitle(title: string): BlogPostBuilder<T & HasTitle> {
		return new BlogPostBuilder({
			...this.data,
			title
		});
	}

	setSlug(slug: string): BlogPostBuilder<T & HasSlug> {
		return new BlogPostBuilder({
			...this.data,
			slug
		});
	}

	setContent(content: string): BlogPostBuilder<T & HasContent> {
		return new BlogPostBuilder({
			...this.data,
			content
		})
	}
}
