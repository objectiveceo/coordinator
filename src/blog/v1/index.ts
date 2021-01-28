import core from 'express'
import MarkdownIt from 'markdown-it'
import Mustache from 'mustache'
import { Database } from 'sqlite3';

const markdown = new MarkdownIt()

export function register(app: core.Application, database: Database) {
	return app.get('/', (req, res) => buildIndex(database, req, res))
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
