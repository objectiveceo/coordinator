import MarkdownIt from "markdown-it/lib"
import Mustache from "mustache"
import { Database } from "sqlite3"
import { Blog, BlogPost } from "."

type Templates = {[key: string]: string}

enum TemplateKey {
	Post = 'post',
	Head = 'head',
	Foot = 'foot',
	FrontPage = 'front-page',
}

const markdown = new MarkdownIt({
	html: true,
	linkify: true,
	typographer: true,
});

export default class TemplateEngine {
	templates: Templates

	static async initialize(database: Database): Promise<TemplateEngine> {
		return new TemplateEngine(await loadTemplates(database))
	}

	generateBlogPost(post: BlogPost): string {
		const template = this.templates[TemplateKey.Post]
		if (!template) {
			throw new Error(`Unable to find template with key ${TemplateKey.Post}`)
		}

		const view = {
			...post,
			creation_date_iso: post.creationDate.toISOString(),
			html_content: markdown.render(post.content),
			html_title: markdown.renderInline(post.title),
		}
		return Mustache.render(template, view, this.lookupPartial)
	}

	async generateFrontPage(blog: Blog): Promise<string> {
		const template = this.templates[TemplateKey.FrontPage]
		if (!template) {
			throw new Error(`Unable to find template with key ${TemplateKey.Post}`)
		}

		const posts = (await blog.fetchPosts()).map(x => ({
			...x,
			html_abstract: markdown.renderInline(x.abstract),
			html_title: markdown.renderInline(x.title)}
		))

		return Mustache.render(template, { posts }, this.lookupPartial)
	}

	private constructor(templates: Templates) {
		this.templates = templates
		this.lookupPartial = this.lookupPartial.bind(this)
	}

	private lookupPartial(name: string): string {
		const partial = this.templates[name]
		if (!partial) {
			throw new Error(`Missing template partial ${name}`)
		}
		return partial
	}
}

async function loadTemplates(database: Database): Promise<Templates> {
	return new Promise((resolve, reject) => {
		database.all('SELECT key, template FROM templates;', (error, rows) => {
			if (error) {
				reject(error)
				return
			}

			const result = rows.reduce( (x, row) => ({...x, [row.key]: row.template }), {})
			resolve(result)
		})
	})
}
