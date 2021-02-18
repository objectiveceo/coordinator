import User from './user'

export interface DbUserConstructor {
	email: string
	identifier?: Number
	name: string
}

export default class DbUser implements User {
	readonly email: string
	readonly identifier?: Number
	readonly name: string
	
	constructor(params: DbUserConstructor) {
		this.email = params.email
		this.identifier = params.identifier
		this.name = params.name
	}
}
