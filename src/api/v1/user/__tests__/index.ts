import express from 'express'
import jsonwebtoken from 'jsonwebtoken'
import request from 'supertest'
import { register } from '../'
import JWTSeedProvider from '../util/jwtseedprovider'
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

class TestSeedProvider implements JWTSeedProvider {
	accessTokenSeed: Promise<string> | null
	refreshTokenSeed: Promise<string> | null

	constructor() {
		this.accessTokenSeed = Promise.resolve('access')
		this.refreshTokenSeed = Promise.resolve('refresh')
	}

	generateAccessTokenSeed(user: User): Promise<string> {
		return this.accessTokenSeed!
	}
	generateRefreshTokenSeed(user: User): Promise<string> {
		return this.refreshTokenSeed!
	}
	revokeAccessToken(user: User): Promise<void> {
		this.accessTokenSeed = null
		return Promise.resolve()
	}
	revokeRefreshToken(user: User): Promise<void> {
		this.refreshTokenSeed = null
		return Promise.resolve()
	}
}

describe('/api/v1/user tests', () => {
	const app = express()
	app.use(express.urlencoded())

	const seedProvider = new TestSeedProvider
	const expirationGenerator = () => {
		return {
			access: { expiresIn: '30s' },
			refresh: { expiresIn: '45s' },
		}
	}

	const storage = new TestUserStorage()
	register(app, storage, seedProvider, expirationGenerator)

	test('GET ./', async () => {
		const result = await request(app)
			.get('/api/v1/user')
			.set('Accept', 'application/json')

		expect(result.status).toBe(200)
	})

	test('POST ./login', async () => {
		const result = await request(app)
			.post('/api/v1/user/login')
			.send('name=test&password=pword')
		
		expect(result.status).toBe(200)

		expect(result.body.accessToken).not.toBeNull()
		const accessPayload = jsonwebtoken.verify(result.body.accessToken, await seedProvider.accessTokenSeed!) as User
		expect(accessPayload.name).toBe('test')
		expect(accessPayload.email).toBe('test@test.com')

		expect(result.body.refreshToken).not.toBeNull()
		const refreshPayload = jsonwebtoken.verify(result.body.refreshToken, await seedProvider.refreshTokenSeed!) as User
		expect(refreshPayload.name).toBe('test')
		expect(refreshPayload.email).toBe('test@test.com')
	})
})
