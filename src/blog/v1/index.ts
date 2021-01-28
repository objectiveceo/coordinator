import core from 'express'
import InMemoryBlog from '../../common/data/InMemoryBlog';

export function register(app: core.Application) {
	return app.get('/', buildIndex)
}

function buildIndex(request: core.Request, response: core.Response) {
	const blog = new InMemoryBlog()
	response.send(blog.fetchPosts().map(x => `<p>${x.title}</p>`).join('\n'))
}
