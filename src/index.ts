import express from 'express'
import process from 'process'
import { register as infoRegister } from './api/v1/info'
import { register as blogRegister } from './blog/v1/index'

const app = express()
const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
	// tslint:disable-next-line:no-console
	console.log(`Open http://localhost:${PORT}`)
})

infoRegister(app)
blogRegister(app)
