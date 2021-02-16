import { Database, RunResult } from 'sqlite3'
import bcrypt from 'bcrypt'
import DbUser from './dbuser'

interface CreateParams {
	email: string
	name: string
	password: string
}

enum VerifyStatus {
	Failure,
	Success,
}

export class VerifyResult {
	readonly status: VerifyStatus
	user?: DbUser

	constructor(status: VerifyStatus, user?: DbUser) {
		this.status = status
		this.user = user
	}
}

export default class UserStorage {
	readonly database: Database
	readonly salt: string

	static async create(database: Database): Promise<UserStorage> {
		return new Promise( async resolve => {
			const salt = await bcrypt.genSalt()
			resolve(new UserStorage(database, salt))
		})
	}

	private constructor(database: Database, salt: string) {
		this.database = database
		this.salt = salt
	}

	async create({ name, email, password}: CreateParams): Promise<DbUser> {
		const hash = await bcrypt.hash(password, this.salt)
		return new Promise( (resolve, reject) => {
			const values = [
				name,
				email,
				hash
			]
			this.database.run(`INSERT INTO users (identifier, email, password_hash) VALUES (?,?,?);`, values, (error: Error | null) => {
				if (error != null) {
					reject(error)
					return
				}
				resolve(new DbUser({ name }))
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
			this.database.get(`SELECT email FROM users WHERE identifier = ? AND password_hash = ?`, values, (error, row) => {
				if (error) {
					reject(error)
					return
				}
				const user = new DbUser({ name: name })
				resolve(new VerifyResult( VerifyStatus.Success, user))
			})
		})
	}

	load(identifier: String): DbUser {
		return new DbUser({ name: 'tmp' })
	}
}
