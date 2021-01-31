import core from 'express'
import { Blog } from '../../common/data';
import TemplateEngine from '../../common/data/TemplateEngine';

export function register(app: core.Application, repository: Blog, templateEngine: TemplateEngine) {
	app.get('/', (req, res) => buildIndex(templateEngine, repository, req, res))
	app.get('/posts/:slug', (req, res) => buildPost(templateEngine, repository, req, res))
}

async function buildPost(templateEngine: TemplateEngine, repository: Blog, request: core.Request, response: core.Response) {
	const post = await repository.fetchPost(request.params.slug)
	if (!post) {
		response.status(404)
		return
	}
	response.send(templateEngine.generateBlogPost(post))
}

async function buildIndex(templateEngine: TemplateEngine, repository: Blog, request: core.Request, response: core.Response) {
	response.send(await templateEngine.generateFrontPage(repository))
}
