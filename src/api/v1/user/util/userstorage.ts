import User from './user'

export interface CreateParams {
	email: string
	name: string
	password: string
}

export enum VerifyStatus {
	Failure,
	Success,
}

export class VerifyResult {
	readonly status: VerifyStatus
	user: User | null

	constructor(status: VerifyStatus, user: User | null) {
		this.status = status
		this.user = user
	}
}

export default interface UserStorage {
	all(): Promise<User[]>
	create({ name, email, password }: CreateParams): Promise<User>
	update(user: User): Promise<void>
	verify({ name, password }: { name: string, password: string }): Promise<VerifyResult>
}
