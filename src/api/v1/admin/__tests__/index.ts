import express from 'express'
import request from 'supertest'
import { register } from '../'
import User from '../util/user'
import UserStorage, { CreateParams, VerifyResult, VerifyStatus } from '../util/userstorage'

class TestUserStorage implements UserStorage {
	create({ name, email, password }: CreateParams): Promise<User> {
		throw new Error('Method not implemented.')
	}

	update(user: User): Promise<void> {
		throw new Error('Method not implemented.')
	}

	verify({ name, password }: { name: string; password: string }): Promise<VerifyResult> {
		return new Promise( (resolve) => {
			switch (name) {
				case 'test':
					resolve(password === 'pword'
						? new VerifyResult(VerifyStatus.Success, { name, email: 'test@test.com' })
						: new VerifyResult(VerifyStatus.Failure, null))
					return
			}
			resolve(new VerifyResult(VerifyStatus.Failure, null))
		})
	}
}

describe('/api/v1/admin tests', () => {
	const app = express()
	app.use(express.urlencoded())

	const storage = new TestUserStorage()
	register(app, storage)

	test('GET ./', async () => {
		const result = await request(app)
			.get('/api/v1/admin')
			.set('Accept', 'application/json')

		expect(result.status).toBe(200)
	})

	test('POST ./login', async () => {
		const result = await request(app)
			.post('/api/v1/admin/login')
			.send('name=test&password=pword')
		
		expect(result.status).toBe(200)
		expect(result.body.status).toBe(1)
		expect(result.body.user).not.toBeNull()
		expect(result.body.user.name).toBe('test')
		expect(result.body.user.email).toBe('test@test.com')
	})
})
