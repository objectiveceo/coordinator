import MarkdownIt from "markdown-it/lib"
import Mustache from "mustache"
import { Database } from "sqlite3"
import { BlogPost } from "."

type Templates = {[key: string]: string}

enum TemplateKey {
	Post = 'post',
	Head = 'head',
	Foot = 'foot',
}

const markdown = new MarkdownIt()

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

	private constructor(templates: Templates) {
		this.templates = templates
		this.lookupPartial = this.lookupPartial.bind(this)
	}

	private lookupPartial(name: string): string {
		const partial = this.templates[name]
		if (!partial) {
			throw `Missing template partial ${name}`
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
