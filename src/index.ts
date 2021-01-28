import express from 'express'
import process from 'process'
import { register } from './api/v1/info'

const app = express()
const PORT = process.env.PORT || 8000
app.get('/', (req,res) => res.send('Hello, world!'))
app.listen(PORT, () => {
	// tslint:disable-next-line:no-console
	console.log(`Open http://localhost:${PORT}`)
})

register(app)
