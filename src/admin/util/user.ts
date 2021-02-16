
export enum SaveResult {
	Success,
	Failure
}

export default interface User {
	readonly name: string
	save(): Promise<SaveResult>
}
