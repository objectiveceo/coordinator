export interface HasTitle { title: string }
export interface HasSlug { slug: string }
export interface HasContent { content: string }

type HasAllFields = HasSlug & HasTitle & HasContent

export default class BlogPost {
	title: string;
	slug: string;
	content: string;

	public static from(builder: HasAllFields) {
		return new BlogPost(builder)
	}

	private constructor(builder: HasAllFields) {
		this.title = builder.title;
		this.slug = builder.slug;
		this.content = builder.content
	}
}
