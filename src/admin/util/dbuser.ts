import User, { SaveResult } from './user'

export interface DbUserConstructor {
	name: string
}

export default class DbUser implements User {
	readonly name: string
	
	constructor(params: DbUserConstructor) {
		this.name = params.name
	}

	save(): SaveResult {
		return SaveResult.Success
	}
}
