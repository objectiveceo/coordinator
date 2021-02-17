
export enum SaveResult {
	Success,
	Failure
}

export default interface User {
	readonly name: string
	readonly email: string
}
