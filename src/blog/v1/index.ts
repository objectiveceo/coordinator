import core from 'express'
import MarkdownIt from 'markdown-it'
import Mustache from 'mustache'
import { Database } from 'sqlite3';
import { Blog } from '../../common/data';
import TemplateEngine from '../../common/data/TemplateEngine';

const markdown = new MarkdownIt()

export function register(app: core.Application, database: Database, repository: Blog, templateEngine: TemplateEngine) {
	app.get('/', (req, res) => buildIndex(database, repository, req, res))
	app.get('/posts/:slug', (req, res) => buildPost(templateEngine, repository, req, res))
}

async function buildPost(templateEngine: TemplateEngine, repository: Blog, request: core.Request, response: core.Response) {
	const post = await repository.fetchPost(request.params.slug)
	if (!post) {
		response.status(404)
		return
	}
	response.send(templateEngine.generateBlogPost(post))
}

async function buildIndex(database: Database, repository: Blog, request: core.Request, response: core.Response) {
	const posts = (await repository.fetchPosts()).map(x => ({
		slug: x.slug,
		title: markdown.renderInline(x.title)}
	))

	database.get('SELECT template FROM templates WHERE key = ?', 'front-page', (error, row) => {
		if (error) {
			throw error
		}

		const output = Mustache.render(row.template, { posts })
		response.send(output)
	})
}
