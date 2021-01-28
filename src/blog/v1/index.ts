import core from 'express'
import MarkdownIt from 'markdown-it'
import Mustache from 'mustache'
import { Database } from 'sqlite3';

const markdown = new MarkdownIt()

export function register(app: core.Application, database: Database) {
	app.get('/', (req, res) => buildIndex(database, req, res))
	app.get('/posts/:slug', (req, res) => buildPost(database, req, res))
}

function buildPost(database: Database, request: core.Request, response: core.Response) {
	const slug = request.params.slug
	database.get('SELECT template FROM templates WHERE key = ?', 'post', (error, row) => {
		if (error) {
			throw error
		}

		const template = row.template
		database.get('SELECT title, contents FROM posts WHERE slug = ?', slug, (postError, postRow) => {
			const view = {
				...postRow,
				contents: markdown.render(postRow.contents)
			}
			const output = Mustache.render(template, view)
			response.send(output)
		})
	})
}

function buildIndex(database: Database, request: core.Request, response: core.Response) {
	database.get('SELECT template FROM templates WHERE key = ?', 'front-page', (error, row) => {
		if (error) {
			throw error
		}

		const template = row.template

		database.all('SELECT title, slug FROM posts ORDER BY date_created DESC;', (postError, rows) => {
			if (postError) {
				throw postError
			}

			const posts = rows.map(x => ({
				slug: x.slug,
				title: markdown.renderInline(x.title)}
			))
			const output = Mustache.render(row.template, { posts })
			response.send(output)
		})
	})
}
