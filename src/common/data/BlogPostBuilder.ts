import { Blog, BlogPost } from ".";
import {
	HasAbstract,
	HasContent,
	HasCreationDate,
	HasSlug,
	HasTitle,
} from "./BlogPost";

export class BlogPostBuilder<T> {
	data: { [key: string]: any; } & T;

	constructor(data: T) {
		this.data = data;
	}

	setAbstract(abstract: string): BlogPostBuilder<T & HasAbstract> {
		return new BlogPostBuilder({
			...this.data,
			abstract
		})
	}

	setContent(content: string): BlogPostBuilder<T & HasContent> {
		return new BlogPostBuilder({
			...this.data,
			content
		})
	}

	setCreationDate(creationDate: Date): BlogPostBuilder<T & HasCreationDate> {
		return new BlogPostBuilder({
			...this.data,
			creationDate
		})
	}

	setSlug(slug: string): BlogPostBuilder<T & HasSlug> {
		return new BlogPostBuilder({
			...this.data,
			slug
		});
	}

	setTitle(title: string): BlogPostBuilder<T & HasTitle> {
		return new BlogPostBuilder({
			...this.data,
			title
		});
	}
}
