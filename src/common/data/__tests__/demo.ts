import InMemoryBlog from '../InMemoryBlog'

test('blog test', () => {
	let blog = new InMemoryBlog()
	blog.fetchPosts().then( posts => expect(posts.length).toBe(1))
})
