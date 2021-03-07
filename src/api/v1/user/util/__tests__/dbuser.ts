import { Database } from 'sqlite3'
import DbUser from '../dbuser'
import { InfoStatus, VerifyStatus } from '../userstorage'
import DbUserStorage from '../dbuserstorage'

describe('DbUser tests', () => {
	const db = createDatabase()
	test('create salt if nonexistent', async () => {
		const storage = await DbUserStorage.create(db)
		db.get('SELECT value FROM _meta WHERE key = ?', 'user_salt', (error, row) => {
			expect(row.value).not.toBeNull()
		})
	})

	test('roundtrip', async () => {
		const storage = await DbUserStorage.create(db)
		const createUser = await storage.create({ name: 'test', email: 'test@test.com', password: 'password' })
		expect(createUser).not.toBeNull()

		const verifyUserResult = await storage.verify({ name: 'test', password: 'password' })
		expect(verifyUserResult).not.toBeNull()
		expect(verifyUserResult.status).toBe(VerifyStatus.Success)
		expect(verifyUserResult.user).not.toBeNull()

		const user = verifyUserResult.user! as DbUser
		expect(user.name).toBe('test')
		expect(user.email).toBe('test@test.com')
		expect(user.identifier).not.toBeNull()
	})

	test('throw error updating unsaved user', async () => {
		const storage = await DbUserStorage.create(db)
		const user = new DbUser({ name: 'test', email: 'email' })
		await expect(storage.update(user)).rejects.toThrow()
	})

	test('verify invalid user', async () => {
		const storage = await DbUserStorage.create(db)
		const result = await storage.verify({ name: 'test', password: 'pword' })
		expect(result).not.toBeNull()
		expect(result.user).toBeNull()
		expect(result.status).toBe(VerifyStatus.Failure)
	})

	db.serialize( () => {
		test('fetching users', async () => {
			const storage = await DbUserStorage.create(db)
			const user = await storage.create({ name: 'all', email: 'all@test', password: 'allpass' })
			const user2 = await storage.create({ name: 'all2', email: 'all2@test', password: 'allpass' })
			const all = await storage.all()

			expect(all.length).toBeGreaterThanOrEqual(2)

			const found = all.filter(x => x.email === user.email)[0]
			expect(found.email).toEqual(user.email)
			expect(found.name).toEqual(user.name)

			const found2 = all.filter(x => x.email === user2.email)[0]
			expect(found2.email).toEqual(user2.email)
			expect(found2.name).toEqual(user2.name)
		})

		test('fetch user info', async () => {
			const storage = await DbUserStorage.create(db)
			const user = await storage.create({ name: 'fetchuser', email: 'fetchuser@test', password: 'fetchpass' })
			const info = await storage.info(user)
			expect(info.status).toEqual(InfoStatus.Exists)
		})

		test('fetch missing user', async () => {
			const storage = await DbUserStorage.create(db)
			const info = await storage.info({ name: 'nonexistent', email: 'non@existent.com' })
			expect(info.status).toEqual(InfoStatus.DoesNotExist)
		})
	})
})

function createDatabase(): Database {
	const db = new Database(':memory:')
	db.serialize(() => {
		db.run(`CREATE TABLE users (
			date_created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			name TEXT NOT NULL,
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
