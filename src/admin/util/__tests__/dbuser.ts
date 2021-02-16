import { Database } from 'sqlite3'
import UserStorage from '../userstorage'

describe('DbUser tests', () => {
	const db = createDatabase()

	test('create salt if nonexistent', async () => {
		const storage = await UserStorage.create(db)
		db.get('SELECT value FROM _meta WHERE key = ?', 'user_salt', (error, row) => {
			expect(row.value).not.toBeNull()
		})
	})

	test('roundtrip', async () => {
		const storage = await UserStorage.create(db)
		const createUser = await storage.create({ name: 'test', email: 'test@test.com', password: 'password' })
		expect(createUser).not.toBeNull()

		const verifyUser = await storage.verify({ name: 'test', password: 'password' })
		expect(verifyUser).not.toBeNull()
	})
})

function createDatabase(): Database {
	const db = new Database(':memory:')
	db.serialize(() => {
		db.run(`CREATE TABLE users (
			date_created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			identifier TEXT NOT NULL,
			email TEXT NOT NULL,
			password_hash TEXT);`)
		db.run(`CREATE TABLE user_logins (
			date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			user_id INTEGER,
			FOREIGN KEY (user_id) REFERENCES users(id));`)
		db.run(`CREATE TABLE _meta (
			key TEXT NOT NULL,
			value TEXT);`)
	})
	return db
}
