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
	iat: number,
	exp: number,
}

export function register(app: core.Application, storage: UserStorage, seedProvider: JWTSeedProvider, seedExpirationGenerator: SeedExpirationGenerator) {
	app.get('/api/v1/user', async (req, resp) => index(req, resp, storage, seedProvider))
	app.put('/api/v1/user', async (req, resp) => createUser(req, resp, storage, seedProvider))
	app.post('/api/v1/user/login', async (req, resp) => login(req, resp, storage, seedProvider, seedExpirationGenerator))
}

async function canCreateInitialUser(storage: UserStorage): Promise<boolean> {
	const users = await storage.all()
	return !(users?.length)
}

async function getJWTPayload(authHeader: string, seedProvider: JWTSeedProvider): Promise<TokenPayload> {
	const accessToken = (authHeader?.split(' ') ?? [,])[1]
	if (!accessToken) {
		throw new Error('Missing access token in Authorization header (must match "Authorization: Bearer <token>"')
	}
	const tmpPayload = jsonwebtoken.decode(accessToken) as TokenPayload
	const payload = jsonwebtoken.verify(accessToken, await seedProvider.generateAccessTokenSeed(tmpPayload.user)) as TokenPayload
	return payload
}

async function index(request: core.Request, response: core.Response, storage: UserStorage, seedProvider: JWTSeedProvider) {
	const authHeader = request.headers.authorization
	if (!authHeader) {
		const payload = {} as any
		if (await canCreateInitialUser(storage)) {
			payload.canCreateInitialUser = true
		}

		response.json(payload)
		return
	}

	response.json(await getJWTPayload(authHeader, seedProvider))
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

async function createUser(request: core.Request, response: core.Response, storage: UserStorage, seedProvider: JWTSeedProvider) {
	const canCreateUser = await (async function() {
		try {
			const authHeader = request.headers.authorization ?? ""
			const payload = !authHeader ? null : await getJWTPayload(authHeader, seedProvider)
			const allowInitialUserCreation = !authHeader && await canCreateInitialUser(storage)
			return allowInitialUserCreation || !!payload
		}
		catch {
			return false
		}
	})()

	if (!canCreateUser) {
		response.status(401)
		response.send('Unauthorized')
		return
	}

	interface CreateUserBody {
		email: string,
		name: string,
		password: string,
	}

	const body = request.body as CreateUserBody
	if (!body || !body.email || !body.name || !body.password) {
		response.status(400)
		response.send('Invalid request body')
		return
	}

	const user = await storage.create(body)
	response.json({ user })
}
