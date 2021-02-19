import { Database } from "sqlite3"
import bcrypt from 'bcrypt'
import DbUser from "./dbuser"
import JWTSeedProvider from "./jwtseedprovider";
import User from "./user";

enum SeedType {
	Access,
	Refresh,
}

async function saveSeed(database: Database, userIdentifier: Number, type: SeedType): Promise<string> {
	const salt = await bcrypt.genSalt()
	return new Promise( (resolve, reject) => {
		database.run('INSERT OR REPLACE INTO jwt_seeds (user_id, seed, type) VALUES (?, ?, ?)', [userIdentifier, salt, type], (error) => {
			if (error) {
				reject(error)
				return
			}
			resolve(salt)
		})
	})
}

async function generateSeed(database: Database, userIdentifier: Number, type: SeedType): Promise<string> {
	return new Promise( (resolve, reject) => {
		database.get('SELECT seed from jwt_seeds WHERE user_id=?', userIdentifier, async (error, row) => {
			if (error) {
				reject(error)
				return
			}

			const seed = row?.token || await saveSeed(database, userIdentifier, SeedType.Access)
			resolve(seed)
		})
	})
}

export default class PersistentJWTSeedProvider implements JWTSeedProvider {
	readonly database: Database

	constructor(database: Database) {
		this.database = database
	}

	generateAccessTokenSeed(user: User): Promise<string> {
		const dbUser = user as DbUser
		return generateSeed(this.database, dbUser.identifier!, SeedType.Access)
	}

	generateRefreshTokenSeed(user: User): Promise<string> {
		const dbUser = user as DbUser
		return generateSeed(this.database, dbUser.identifier!, SeedType.Refresh)
	}

	revokeAccessToken(user: User): Promise<void> {
		throw new Error("Method not implemented.");
	}
	revokeRefreshToken(user: User): Promise<void> {
		throw new Error("Method not implemented.");
	}
}
