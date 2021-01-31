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
			this.database.get('SELECT title, contents, date_created FROM posts WHERE slug = ?', slug, (error, row) => {
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
					.setCreationDate(row.creationDate)

				resolve(BlogPost.from(builder.data))
			})
		})
	}

	fetchPosts(): Promise<BlogPost[]> {
		return new Promise( (resolve, reject) => {
			this.database.all('SELECT title, slug, contents, date_created FROM posts ORDER BY date_created DESC;', (error, rows) => {
				if (error) {
					reject(error)
					return
				}

				type RowType = {
					contents: string,
					date_created: string
					slug: string;
					title: string;
				}
				const posts = rows.map((row: RowType) => {
					const builder = new BlogPostBuilder({})
						.setContent(row.contents)
						.setCreationDate(new Date(`${row.date_created} UTC`))
						.setSlug(row.slug)
						.setTitle(row.title)
					return BlogPost.from(builder.data)
				})
				resolve(posts)
			})
		})
	}
}
