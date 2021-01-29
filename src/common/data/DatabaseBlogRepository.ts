import { Database } from "sqlite3";
import { Blog, BlogPost } from ".";
import { BlogPostBuilder } from "./BlogPostBuilder";

export default class DatabaseBlogRepository implements Blog {
	database: Database

	constructor(database: Database) {
		this.database = database
	}

	fetchPost(slug: string): Promise<BlogPost | null> {
		return new Promise( (resolve, reject) => {
			this.database.get('SELECT title, contents FROM posts WHERE slug = ?', slug, (error, row) => {
				if (error) {
					reject(error)
					return
				}

				if (!row) {
					resolve(null)
					return
				}

				const builder = new BlogPostBuilder({})
					.setSlug(slug)
					.setTitle(row.title)
					.setContent(row.contents)

				resolve(BlogPost.from(builder.data))
			})
		})
	}

	fetchPosts(): Promise<BlogPost[]> {
		return new Promise( (resolve, reject) => {
			this.database.all('SELECT title, slug, contents FROM posts ORDER BY date_created DESC;', (error, rows) => {
				if (error) {
					reject(error)
					return
				}

				const posts = rows.map((row: { title: string; slug: string; contents: string }) => {
					const builder = new BlogPostBuilder({})
						.setTitle(row.title)
						.setSlug(row.slug)
						.setContent(row.contents)
					return BlogPost.from(builder.data)
				})
				resolve(posts)
			})
		})
	}
}
