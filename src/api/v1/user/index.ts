import core, { json } from 'express'
import jsonwebtoken from 'jsonwebtoken'
import JWTSeedProvider from './util/jwtseedprovider'
import User from './util/user'
import UserStorage from './util/userstorage'

export interface SeedExpiration {
	expiresIn: string,
}

export type SeedExpirationGenerator = () => { access: SeedExpiration, refresh: SeedExpiration }

export interface TokenPayload {
	user: User,
	iat: Number,
	exp: Number,
}

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

	const accessSeed = await seedProvider.generateAccessTokenSeed(user)
	const accessToken = jsonwebtoken.sign({ user }, accessSeed, { expiresIn: expirations.access.expiresIn })

	const refreshTokenSeed = await seedProvider.generateRefreshTokenSeed(user)
	const refreshToken = jsonwebtoken.sign({ user }, refreshTokenSeed, { expiresIn: expirations.refresh.expiresIn })

	response.json({ accessToken, refreshToken })
}
