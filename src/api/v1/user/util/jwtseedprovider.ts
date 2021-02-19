import User from "./user";

export default interface JWTSeedProvider {
	generateAccessTokenSeed(user: User): Promise<string>
	generateRefreshTokenSeed(user: User): Promise<string>

	revokeAccessToken(user: User): Promise<void>
	revokeRefreshToken(user: User): Promise<void>
}
