import User from './user'

export interface DbUserConstructor {
	email: string
	identifier?: number
	name: string
}

export default class DbUser implements User {
	readonly email: string
	readonly identifier?: number
	readonly name: string

	constructor(params: DbUserConstructor) {
		this.email = params.email
		this.identifier = params.identifier
		this.name = params.name
	}
}
