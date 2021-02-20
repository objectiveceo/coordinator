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
	app.get('/api/v1/user', async (req, resp) => index(req, resp, seedProvider))
	app.post('/api/v1/user/login', async (req, resp) => login(req, resp, storage, seedProvider, seedExpirationGenerator))
}

async function index(request: core.Request, response: core.Response, seedProvider: JWTSeedProvider) {
	const authHeader = request.headers.authorization
	if (!authHeader) {
		response.json({})
		return
	}

	const accessToken = authHeader.split(' ')[1]
	if (!accessToken) {
		throw new Error('Missing access token in Authorization header (must match "Authorization: Bearer <token>"')
	}
	const tmpPayload = jsonwebtoken.decode(accessToken) as TokenPayload
	const payload = jsonwebtoken.verify(accessToken, await seedProvider.generateAccessTokenSeed(tmpPayload.user))

	response.json(payload)
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
