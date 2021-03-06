import { Database } from 'sqlite3'
import bcrypt from 'bcrypt'
import DbUser from './dbuser'
import UserStorage, { CreateParams, VerifyResult, VerifyStatus } from './userstorage'
import User from './user'

async function saveSalt(database: Database): Promise<string> {
	return new Promise( async (resolve, reject) => {
		const salt = await bcrypt.genSalt()
		database.run('INSERT INTO _meta (key, value) VALUES (?, ?);', ['user_salt', salt], (error) => {
			if (error) {
				reject(error)
				return
			}
			resolve(salt)
		})
	})
}

type DbUserRow = {
	name: string,
	email: string,
	rowid: number,
}

export default class DbUserStorage implements UserStorage {
	readonly database: Database
	readonly salt: string

	static async create(database: Database): Promise<DbUserStorage> {
		return new Promise( async (resolve, reject) => {
			database.get('SELECT value FROM _meta WHERE key = ?', 'user_salt', async (error, row) => {
				if (error) {
					reject(error)
					return
				}
				const salt = row?.value || await saveSalt(database)
				resolve(new DbUserStorage(database, salt))
			})
		})
	}

	private constructor(database: Database, salt: string) {
		this.database = database
		this.salt = salt
	}

	all(): Promise<User[]> {
		return new Promise( (resolve, reject) => {
			this.database.all(`SELECT name, email, rowid FROM users;`, (error, rows) => {
				if (error) {
					reject(error)
					return
				}
				const users = rows.map((row: DbUserRow) => new DbUser({ identifier: row.rowid, ...row }))
				resolve(users)
			})
		})
	}

	async create({ name, email, password }: CreateParams): Promise<DbUser> {
		const hash = await bcrypt.hash(password, this.salt)
		return new Promise( (resolve, reject) => {
			const values = [
				name,
				email,
				hash
			]
			this.database.run(`INSERT INTO users (name, email, password_hash) VALUES (?,?,?);`, values, function (error: Error | null) {
				if (error != null) {
					reject(error)
					return
				}
				resolve(new DbUser({ name, email, identifier: this.lastID }))
			})
		})
	}

	async update(user: DbUser): Promise<void> {
		return new Promise( (resolve, reject) => {
			if (!user.identifier) {
				reject(new Error(`User must have identifier.  Did you mean to create? [User: ${JSON.stringify(user)}`))
				return
			}

			this.database.run(`UPDATE users SET email=?, name=? WHERE id=?`, [user.email, user.name, user.identifier], (error) => {
				if (error) {
					reject(error)
					return
				}
				resolve()
			})
		})
	}

	async verify({ name, password }: { name: string, password: string }): Promise<VerifyResult> {
		const hash = await bcrypt.hash(password, this.salt)
		return new Promise( (resolve, reject) => {
			const values = [
				name,
				hash
			]
			this.database.get(`SELECT email, rowid FROM users WHERE name = ? AND password_hash = ?`, values, (error, row) => {
				if (error) {
					reject(error)
					return
				}

				if (!row) {
					resolve(new VerifyResult( VerifyStatus.Failure, null ))
					return
				}

				const user = new DbUser({ name, email: row.email, identifier: row.rowid })
				resolve(new VerifyResult( VerifyStatus.Success, user))
			})
		})
	}
}
