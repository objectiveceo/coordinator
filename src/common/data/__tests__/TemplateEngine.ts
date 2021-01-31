import TemplateEngine from '../TemplateEngine'
import { Database } from "sqlite3";
import { BlogPost } from '..';
import { BlogPostBuilder } from '../BlogPostBuilder';

describe('TemplateEngine', () => {
	const emptyDb = new Database(':memory:')
	emptyDb.serialize(() => emptyDataTests(setup(emptyDb)))

	const partiallyFilledDb = new Database(':memory:')
	partiallyFilledDb.serialize(() => partiallyFilledTests(setup(partiallyFilledDb)))
})

function partiallyFilledTests(db: Database) {db.run(`INSERT INTO templates (key, template) VALUES ('post', '{{>head}} test');`)		
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
