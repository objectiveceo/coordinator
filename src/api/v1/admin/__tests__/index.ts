import express from 'express'
import request from 'supertest'
import { register } from '../'
import user from '../util/user'
import UserStorage, { CreateParams, VerifyResult } from '../util/userstorage'

class TestUserStorage implements UserStorage {
	create({ name, email, password }: CreateParams): Promise<user> {
		throw new Error('Method not implemented.')
	}
	update(user: user): Promise<void> {
		throw new Error('Method not implemented.')
	}
	verify({ name, password }: { name: string; password: string }): Promise<VerifyResult> {
		throw new Error('Method not implemented.')
	}
}

describe('/api/v1/admin tests', () => {
	const app = express()
	const storage = new TestUserStorage()
	register(app, storage)

	test('GET ./', async () => {
		const result = await request(app)
			.get('/api/v1/admin')
			.set('Accept', 'application/json')

		expect(result.status).toBe(200)
	})
})
