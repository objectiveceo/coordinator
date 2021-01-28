import core from 'express'
import { Database } from 'sqlite3';

export function register(app: core.Application, database: Database) {
	return app.get('/', (req, res) => buildIndex(database, req, res))
}

function buildIndex(database: Database, request: core.Request, response: core.Response) {
	database.get('SELECT template FROM templates WHERE key = ?', 'front-page', (error, row) => {
		if (error) {
			throw error
		}
		response.send(row.template)
	})
}
