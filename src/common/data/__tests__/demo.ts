import InMemoryBlog from '../InMemoryBlog'

test('blog test', () => {
	let blog = new InMemoryBlog()
	let posts = blog.fetchPosts()
	expect(posts.length).toBe(1)
})
