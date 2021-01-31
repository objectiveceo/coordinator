export interface HasAbstract { abstract: string }
export interface HasContent { content: string }
export interface HasCreationDate { creationDate: Date }
export interface HasSlug { slug: string }
export interface HasTitle { title: string }

type HasAllFields = HasAbstract & HasContent & HasCreationDate & HasSlug & HasTitle

export default class BlogPost {
	abstract: string
	content: string
	creationDate: Date
	slug: string
	title: string

	public static from(builder: HasAllFields) {
		return new BlogPost(builder)
	}

	private constructor(builder: HasAllFields) {
		this.abstract = builder.abstract
		this.content = builder.content
		this.creationDate = builder.creationDate
		this.slug = builder.slug
		this.title = builder.title
	}
}
