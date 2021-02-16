import { userInfo } from 'os'
import User, { SaveResult } from './user'
import UserStorage from './userstorage'

export interface DbUserConstructor {
	email: string
	identifier?: Number
	name: string
	storage: UserStorage
}

export default class DbUser implements User {
	readonly email: string
	readonly identifier?: Number
	readonly name: string
	readonly storage: UserStorage
	
	constructor(params: DbUserConstructor) {
		this.email = params.email
		this.identifier = params.identifier
		this.name = params.name
		this.storage = params.storage
	}

	async save(): Promise<SaveResult> {
		await this.storage.update(this)
		return SaveResult.Success
	}
}
