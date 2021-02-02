import { Blog, BlogPost } from '..'
import { BlogPostBuilder } from '../BlogPostBuilder'
import generate from '../RSS'

describe('RSS', () => {
	test('Generate', async () => {
		const blog = new TestBlog
		const linkGenerator = (p: BlogPost) => `base/${p.slug}`
		const feed = await generate({ title: "<title>", copyright: "copyright", id: "identifier", linkGenerator }, blog)
		
		expect(feed.options.title).toBe('<title>')
		expect(feed.options.copyright).toBe('copyright')
		expect(feed.options.id).toBe('identifier')
		expect(feed.items.length).toBe(2)

		const item = feed.items[0]
		expect(item.title).toBe('post-title')
		expect(item.date).toBe(testDate)
		expect(item.link).toBe('base/post-slug')
		expect(item.content).toBe('post-content')
	})
})

const testDate = new Date()

class TestBlog implements Blog {
	async fetchPosts(): Promise<BlogPost[]> {
		return [
			BlogPost.from(new BlogPostBuilder({})
				.setAbstract('abstract')
				.setContent('post-content')
				.setCreationDate(testDate)
				.setSlug('post-slug')
				.setTitle('post-title')
				.data),
			BlogPost.from(new BlogPostBuilder({})
				.setAbstract('abstract')
				.setContent('post-content')
				.setCreationDate(testDate)
				.setSlug('post-slug')
				.setTitle('post-title')
				.data)
		]
	}

	async fetchPost(slug: string): Promise<BlogPost | null> {
		return null
	}
}
