import core, { json } from 'express'
import jsonwebtoken from 'jsonwebtoken'
import JWTSeedProvider from './util/jwtseedprovider'
import UserStorage from './util/userstorage'

export interface SeedExpiration {
	date: Date,
	expiresIn: string,
}

export type SeedExpirationGenerator = () => { access: SeedExpiration, refresh: SeedExpiration }

export function register(app: core.Application, storage: UserStorage, seedProvider: JWTSeedProvider, seedExpirationGenerator: SeedExpirationGenerator) {
	app.get('/api/v1/user', index)
	app.post('/api/v1/user/login', async(req, resp) => await login(req, resp, storage, seedProvider, seedExpirationGenerator))
}

function index(request: core.Request, response: core.Response) {
	response.json({})
}

async function login(request: core.Request, response: core.Response, storage: UserStorage, seedProvider: JWTSeedProvider, seedExpirationGenerator: SeedExpirationGenerator) {
	const result = await storage.verify(request.body)
	const user = result.user!

	const expirations = seedExpirationGenerator()
	const accessPayload = {
		...user,
		expiration: expirations.access.date,
	}

	const accessSeed = await seedProvider.generateAccessTokenSeed(user)
	const accessToken = jsonwebtoken.sign(accessPayload, accessSeed, { expiresIn: expirations.access.expiresIn })

	const refreshTokenSeed = await seedProvider.generateRefreshTokenSeed(user)
	const refreshToken = jsonwebtoken.sign(user, refreshTokenSeed, { expiresIn: expirations.refresh.expiresIn })

	response.json({ accessToken, refreshToken })
}
