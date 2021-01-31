export interface HasContent { content: string }
export interface HasCreationDate { creationDate: Date }
export interface HasSlug { slug: string }
export interface HasTitle { title: string }

type HasAllFields = HasContent & HasCreationDate & HasSlug & HasTitle

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
