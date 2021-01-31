import TemplateEngine from '../TemplateEngine'
import { Database } from "sqlite3";
import { BlogPost } from '..';
import { BlogPostBuilder } from '../BlogPostBuilder';

describe('TemplateEngine', () => {
	const db = new Database(':memory:')
	db.serialize(() => tests(setup(db)))

	const emptyDb = new Database(':memory:')
	emptyDb.serialize(() => emptyDataTests(setup(emptyDb)))

	const partiallyFilledDb = new Database(':memory:')
	partiallyFilledDb.serialize(() => partiallyFilledTests(setup(partiallyFilledDb)))
})

function tests(db: Database) {
	const postTemplate = `{{>head}}

{{&html_title}}
{{&html_content}}
{{&creation_date_iso}}
{{>foot}}`

	db.run(`INSERT INTO templates (key, template) VALUES
		('post', ?),
		('head', '<head>{{#title}}{{.}}{{/title}}'),
		('foot', '<foot>');`, postTemplate)

	const creationDate = new Date('2021-01-28 12:48:57')

	test('generate template', async () => {
		const engine = await TemplateEngine.initialize(db)
		const post = BlogPost.from(new BlogPostBuilder({})
			.setAbstract('abstract')
			.setContent('# content')
			.setCreationDate(creationDate)
			.setSlug('slug')
			.setTitle('*title*')
			.data)
		expect(engine.generateBlogPost(post))
			.toMatch(/<head>\*title\*\n<em>title<\/em>\n<h1>content<\/h1>\n\n\d{4}-\d{2}-\d{2}T.*Z\n<foot>/)
	})
}

function partiallyFilledTests(db: Database) {
	db.run(`INSERT INTO templates (key, template) VALUES ('post', '{{>head}} test');`)
	test('fetch formatting head template', async () => {
		const engine = await TemplateEngine.initialize(db)
		expect(() => engine.generateBlogPost(basicBlogPost))
			.toThrow('Missing template partial head')
	})
}

function emptyDataTests(db: Database) {
	test('fetch missing root template', async () => {
		const engine = await TemplateEngine.initialize(db)
		expect(() => engine.generateBlogPost(basicBlogPost))
			.toThrow('Unable to find template with key post')
	})
}

const basicBlogPost = BlogPost.from(new BlogPostBuilder({})
	.setAbstract('abstract')
	.setCreationDate(new Date())
	.setContent('content')
	.setSlug('slug')
	.setTitle('title')
	.data)

function setup(db: Database): Database {
	db.run(`CREATE TABLE templates (
		date_added DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
		key TEXT NOT NULL,
		template TEXT NOT NULL
		);`)		
	return db
}
