import dotenv from 'dotenv'
import express from 'express'
import fs from 'fs'
import process from 'process'
import sqlite3 from 'sqlite3'
import { register as infoRegister } from './api/v1/info'
import { register as blogRegister } from './blog/v1/index'
import { register as syndicationRegister } from './syndication'
import DatabaseBlogRepository from './common/data/DatabaseBlogRepository'
import TemplateEngine from './common/data/TemplateEngine'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 8000
const DATABASE_PATH = process.env.DATABASE_PATH || ''
const BLOG_NAME = process.env.BLOG_NAME || 'objective-ceo'
const ROOT_URL = process.env.ROOT_URL || 'http://objectiveceo.com'
const COPYRIGHT = process.env.COPYRIGHT || `2021 - ${new Date().getFullYear()}`

if (!fs.existsSync(DATABASE_PATH)) {
	throw new Error(`Must provide valid DATABASE_PATH (provided '${DATABASE_PATH}')`)
}

const database = new sqlite3.Database(DATABASE_PATH, error => {
	if (error) {
		throw error
	}
})

const blogRepository = new DatabaseBlogRepository(database)

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.listen(PORT, () => {
	// tslint:disable-next-line:no-console
	console.log(`Open http://localhost:${PORT}`)
})

TemplateEngine.initialize(database).then(templateEngine => {
	infoRegister(app)
	blogRegister(app, blogRepository, templateEngine)
	syndicationRegister(app, { title: BLOG_NAME, id: ROOT_URL, copyright: COPYRIGHT, linkGenerator: (p) => `${ROOT_URL}/posts/${p.slug}` }, blogRepository)
})
