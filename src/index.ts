import express from 'express'
import fs from 'fs'
import process from 'process'
import sqlite3 from 'sqlite3'
import { register as infoRegister } from './api/v1/info'
import { register as blogRegister } from './blog/v1/index'

const app = express()
const PORT = process.env.PORT || 8000
const DATABASE_PATH = process.env.DATABASE_PATH || ''

if (!fs.existsSync(DATABASE_PATH)) {
	throw new Error(`Must provide valid DATABASE_PATH (provided '${DATABASE_PATH}')`)
}

const database = new sqlite3.Database(DATABASE_PATH, error => {
	if (error) {
		throw error
	}
})

app.listen(PORT, () => {
	// tslint:disable-next-line:no-console
	console.log(`Open http://localhost:${PORT}`)
})

infoRegister(app)
blogRegister(app)
