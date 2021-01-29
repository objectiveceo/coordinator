export interface HasTitle { title: string }
export interface HasSlug { slug: string }

type HasAllFields = HasSlug & HasTitle

export default class BlogPost {
	title: string;
	slug: string;

	public static from(builder: HasAllFields) {
		return new BlogPost(builder)
	}

	private constructor(builder: HasAllFields) {
		this.title = builder.title;
		this.slug = builder.slug;
	}
}
