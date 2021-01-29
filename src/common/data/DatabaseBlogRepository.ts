import { Database } from "sqlite3";
import { Blog, BlogPost } from ".";
import { BlogPostBuilder } from "./BlogPostBuilder";

export default class DatabaseBlogRepository implements Blog {
	database: Database

	constructor(database: Database) {
		this.database = database
	}

	fetchPosts(): Promise<BlogPost[]> {
		return new Promise( (resolve, reject) => {
			this.database.all('SELECT title, slug FROM posts ORDER BY date_created DESC;', (error, rows) => {
				if (error) {
					reject(error)
					return
				}

				const posts = rows.map((row: { title: string; slug: string }) => {
					const builder = new BlogPostBuilder({})
						.setTitle(row.title)
						.setSlug(row.slug)
					return BlogPost.from(builder.data)
				})
				resolve(posts)
			})
		})
	}
}
