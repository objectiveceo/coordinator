export interface HasContent { content: string }
export interface HasCreationDate { creationDate: Date }
export interface HasSlug { slug: string }
export interface HasTitle { title: string }

type HasAllFields = HasContent & HasCreationDate & HasSlug & HasTitle

export default class BlogPost {
	builder: HasAllFields

	public static from(builder: HasAllFields) {
		return new BlogPost(builder)
	}

	get content(): string { return this.builder.content }
	get creationDate(): Date { return this.builder.creationDate }
	get slug(): string { return this.builder.slug }
	get title(): string { return this.builder.title }

	private constructor(builder: HasAllFields) {
		this.builder = builder
	}
}
