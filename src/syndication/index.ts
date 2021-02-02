import { Blog } from "../common/data";
import core, { Response } from 'express'
import generate, { BlogInfo } from "../common/data/RSS";

export function register(app: core.Application, info: BlogInfo, repository: Blog) {
	app.get('/syndication/:type(atom|json|rss)', (req, res) => syndicate(info, repository, req, res))
}

async function syndicate(info: BlogInfo, repository: Blog, request: core.Request, response: Response) {
	const feed = await generate(info, repository)
	switch (request.params.type) {
		case 'atom':
			response.type('application/atom+xml')
			response.send(feed.atom1())
		case 'json':
			response.type('application/json')
			response.send(feed.json1())
		case 'rss':
			response.type('application/rss+xml')
			response.send(feed.rss2())
	}
}
