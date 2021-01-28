import core from 'express'
import Mustache from 'mustache'
import { Database } from 'sqlite3';
import InMemoryBlog from '../../common/data/InMemoryBlog';

export function register(app: core.Application, database: Database) {
	return app.get('/', (req, res) => buildIndex(database, req, res))
}

function buildIndex(database: Database, request: core.Request, response: core.Response) {
	database.get('SELECT template FROM templates WHERE key = ?', 'front-page', (error, row) => {
		if (error) {
			throw error
		}

		const blog = new InMemoryBlog()
		const posts = blog.fetchPosts()
		const output = Mustache.render(row.template, { posts })

		response.send(output)
	})
}
