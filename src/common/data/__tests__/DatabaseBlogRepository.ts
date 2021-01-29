import DatabaseBlogRepository from '../DatabaseBlogRepository'
import { Database } from "sqlite3";

describe('DatabaseBlogRepostory', () => {
	const db = createDatabase()
	db.serialize(() => tests(db))
})

function tests(db: Database) {
	db.run(`INSERT INTO
		posts (title, contents, abstract, slug)
		VALUES ('test title', 'test contents', 'test abstract', 'test-slug')`)

	const repo = new DatabaseBlogRepository(db)

	test('fetch posts', async () => {
		const posts = await repo.fetchPosts()
		expect(posts.length).toBe(1)
	})
}

function createDatabase(): Database {
	const db = new Database(':memory:')
	db.run(`CREATE TABLE posts (
		date_created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
		title TEXT NOT NULL,
		contents TEXT NOT NULL,
		abstract TEXT,
		slug varchar(255) NULL);`)		
	return db
}