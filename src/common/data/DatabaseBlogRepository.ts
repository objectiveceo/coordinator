import { Database } from "sqlite3";
import { Blog, BlogPost } from ".";

export default class DatabaseBlogRepository implements Blog {
	database: Database

	constructor(database: Database) {
		this.database = database
	}

	fetchPosts(): Promise<BlogPost[]> {
		return new Promise( (resolve, reject) => {
			this.database.all('SELECT title FROM posts ORDER BY date_created DESC;', (error, rows) => {
				if (error) {
					reject(error)
					return
				}

				const posts = rows.map((row: { title: string; }) => new BlogPost(row.title))
				resolve(posts)
			})
		})
	}
}
